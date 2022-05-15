import Event from 'ol/events/Event';
import BaseObject from 'ol/Object';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { getDistance as getSphericalDistance } from 'ol/sphere';
import Feature from 'ol/Feature';
import {
  LineString,
  Point,
  Polygon,
} from 'ol/geom';
import { transform } from 'ol/proj';

import {
  elementWiseVectorProduct,
  addVectors,
  scaleVector,
  getOrthogonalBasisVector,
} from './vector-math';

import ButtonControl from './button-control';
import SelectControl from './select-control';
import HidableRotatedOverlay from './hidable-rotated-overlay';


/**
 * Default units and their meter conversions.
 */
const UNIT_CONVERSIONS = {
  m: 1.0,
  ft: 1 / 3.28084,
  in: 0.0254,
};


/**
 * @enum {string}
 */
export const BedGeneratorEventType = {
  /**
   * Triggered when the confirm button is clicked.
   * @event TouchDrawEvent#confirm_bed_gen
   * @api
   */
  CONFIRM_BED_GEN: 'confirm_bed_gen',
};

/**
 * @classdesc
 * Events emitted by {@link BedGeneratorFeatureDraftingState} instances are instances of this type.
 */
export class BedGeneratorEvent extends Event {
  /**
   * @param {BedGeneratorEventType} type Type.
   * @param {Feature} feature The feature drawn.
   */
  constructor(type, features) {
    super(type);

    /**
     * The feature being drawn.
     * @type {Feature}
     * @api
     */
    this.features = features;
  }
}

/**
 * Encapsulates the state for previewing/modifying the draft grid of
 * beds to be generated.
 * @private
 */
export class BedGeneratorFeatureDraftingState extends BaseObject {
  /**
   * @param {Object=} optOptions BaseObject options.
   */
  constructor(optOptions) {
    const options = optOptions || {};

    super(options);

    const { map } = options;
    this.map = map;

    this.workflowControlPointsVectorLayer = options.workflowControlPointsVectorLayer;

    /**
     * Draw overlay where our grid feature is drawn.
     * @type {VectorLayer}
     * @private
     */
    this.overlay = new VectorLayer({
      source: new VectorSource({
        features: [],
        wrapX: false,
      }),
      updateWhileInteracting: true,
    });

    this.overlay.setMap(map);

    this.unitSelect = new SelectControl({
      className: 'unit-selector-bed-generator',
      optionValues: Object.keys(UNIT_CONVERSIONS),
      selectedOption: options.units === 'us' ? 'ft' : 'm',
    });
    map.addControl(this.unitSelect);

    const getUnitConversionFactor = () => {
      const selectedUnit = this.unitSelect.get('selection');
      return UNIT_CONVERSIONS[selectedUnit];
    };

    this.confirmButton = new ButtonControl({
      className: 'confirm-bed-generator',
      label: '✓',
    });
    this.confirmButton.on('click', () => this.handleConfirmButtonClick());
    map.addControl(this.confirmButton);

    this.xRepeat = 2;
    this.yRepeat = 2;
    this.xSize = 50 * getUnitConversionFactor();
    this.ySize = 50 * getUnitConversionFactor();
    this.xIsleSize = 10 * getUnitConversionFactor();
    this.yIsleSize = 10 * getUnitConversionFactor();

    this.draftFeatures = [];

    const createInputPopup = (getter, setter, pattern, parser) => {
      const inputElement = document.createElement('input');
      inputElement.value = getter();
      inputElement.type = 'text';
      inputElement.required = true;
      inputElement.pattern = pattern || '-?([0-9]+)?(\\.[0-9]+)?';

      inputElement.addEventListener('focus', () => {
        inputElement.setSelectionRange(0, inputElement.value.length);
      }, false);

      inputElement.addEventListener('input', (event) => {
        const desiredValue = (parser || parseFloat)(event.target.value);

        inputElement.checkValidity();

        setter(desiredValue);
        this.updateDraftFeatures();
      }, false);

      const inputPopupElement = document.createElement('div');
      inputPopupElement.className = 'bed-generator-dim-popup';
      inputPopupElement.appendChild(inputElement);

      const overlay = new HidableRotatedOverlay({
        element: inputPopupElement,
        positioning: 'center-center',
        stopEvent: false,
        rotateWithView: true,
        // Modifies the rotation such that the input text is never upsidedown.
        rotationTransform: (r) => {
          let ar = r % (2 * Math.PI);
          if (ar < 0) {
            ar += (2 * Math.PI);
          }

          if (ar < (Math.PI * 0.25) || ar > (Math.PI * 1.75)) {
            return ar;
          }

          if (ar < (Math.PI * 0.75)) {
            return ar - (Math.PI / 2);
          }

          if (ar > (Math.PI * 1.25)) {
            return ar - (1.5 * Math.PI);
          }

          return ar - Math.PI;
        },
      });
      overlay.inputElement = inputElement;

      overlay.recomputeInputValue = () => {
        if (document.activeElement !== inputElement) {
          inputElement.value = getter();
        }
      };

      this.unitSelect.on('change:selection', overlay.recomputeInputValue);

      return overlay;
    };

    this.XYRepeatPopup = createInputPopup(() => `${this.xRepeat}x${this.yRepeat}`, (rawV) => {
      const v = rawV.indexOf('x') !== -1 ? rawV : `${rawV}x`;
      [this.xRepeat, this.yRepeat] = v.split('x').map(r => parseInt(r, 10)).map(r => (r || 1));
    }, '-?([0-9]+)x-?([0-9]+)', v => v);
    map.addOverlay(this.XYRepeatPopup);

    this.XDimPopup = createInputPopup(
      () => this.xSize / getUnitConversionFactor(),
      /* eslint no-return-assign: ["error", "except-parens"] */
      v => (this.xSize = v * getUnitConversionFactor()),
    );
    map.addOverlay(this.XDimPopup);

    this.YDimPopup = createInputPopup(
      () => this.ySize / getUnitConversionFactor(),
      /* eslint no-return-assign: ["error", "except-parens"] */
      v => (this.ySize = v * getUnitConversionFactor()),
    );
    map.addOverlay(this.YDimPopup);

    this.XIsleDimPopup = createInputPopup(
      () => this.xIsleSize / getUnitConversionFactor(),
      /* eslint no-return-assign: ["error", "except-parens"] */
      v => (this.xIsleSize = v * getUnitConversionFactor()),
    );
    map.addOverlay(this.XIsleDimPopup);

    this.YIsleDimPopup = createInputPopup(
      () => this.yIsleSize / getUnitConversionFactor(),
      /* eslint no-return-assign: ["error", "except-parens"] */
      v => (this.yIsleSize = v * getUnitConversionFactor()),
    );
    map.addOverlay(this.YIsleDimPopup);

    this.workflowControlPointsVectorLayer.getSource().on('changefeature', () => this.updateDraftFeatures());

    this.updateDraftFeatures();
  }

  updateDraftFeatures() {
    const { map } = this;

    const features = this.workflowControlPointsVectorLayer.getSource().getFeatures();

    const originCoordinate = features.find(f => f.get('controlPointType') === 'origin').getGeometry().getCoordinates();
    const rotationAnchorCoordinate = features.find(f => f.get('controlPointType') === 'rotation').getGeometry().getCoordinates();

    const mapViewProj = map.getView().getProjection();

    // ol.sphere.getDistance - a.k.a. 'getSphericalDistance' here - only seems to work correctly
    // in 'EPSG:4326'
    const cp1 = transform(originCoordinate, mapViewProj, 'EPSG:4326');

    const cp2 = transform(rotationAnchorCoordinate, mapViewProj, 'EPSG:4326');

    const cp3 = [cp1[0], cp2[1]];
    const cp4 = [cp2[0], cp1[1]];

    const len = getSphericalDistance(cp1, cp2);
    let rise = getSphericalDistance(cp1, cp3);
    let run = getSphericalDistance(cp1, cp4);

    // Potential bug: This approach to calculating the direction of the rise/run probably won't
    // work correctly when the coordinates wrap around.
    if (cp1[0] > cp2[0]) {
      run *= -1;
    }

    if (cp1[1] > cp2[1]) {
      rise *= -1;
    }

    const riseFactor = rise / len;
    const runFactor = run / len;

    // Calculate orthogonal basis vectors for the array of beds
    let xBasisVector = [
      runFactor,
      riseFactor,
    ];
    let yBasisVector = [
      (-1) * riseFactor,
      runFactor,
    ];

    const localSphereNormalizationCoefficients = this
      .calculateLocalSphereNormalizationCoefficients(new Point(originCoordinate));

    xBasisVector = elementWiseVectorProduct(xBasisVector,
      localSphereNormalizationCoefficients);
    yBasisVector = elementWiseVectorProduct(yBasisVector,
      localSphereNormalizationCoefficients);

    const xDirection = this.xRepeat < 0 ? -1 : 1;
    const yDirection = this.yRepeat < 0 ? -1 : 1;

    xBasisVector = scaleVector(xBasisVector, xDirection);
    yBasisVector = scaleVector(yBasisVector, yDirection);

    this.draftFeatures.forEach(f => this.overlay.getSource().removeFeature(f));
    this.draftFeatures = [];

    const addFeature = (xIndex, yIndex) => {
      const originOffsetX = xIndex * (this.xSize + this.xIsleSize);
      const originOffsetY = yIndex * (this.ySize + this.yIsleSize);

      const xOffsetVector = scaleVector(xBasisVector, originOffsetX);
      const yOffsetVector = scaleVector(yBasisVector, originOffsetY);

      const localOrigin = addVectors(originCoordinate, xOffsetVector, yOffsetVector);

      const xSizeVector = scaleVector(xBasisVector, this.xSize);
      const ySizeVector = scaleVector(yBasisVector, this.ySize);

      this.draftFeatures.push(new Feature({
        geometry: new Polygon([[
          localOrigin,
          addVectors(localOrigin, xSizeVector),
          addVectors(localOrigin, xSizeVector, ySizeVector),
          addVectors(localOrigin, ySizeVector),
          localOrigin,
        ]], 'XY'),
      }));
    };

    for (let xi = 0; xi < Math.abs(this.xRepeat); xi += 1) {
      for (let yi = 0; yi < Math.abs(this.yRepeat); yi += 1) {
        addFeature(xi, yi);
      }
    }

    this.overlay.getSource().addFeatures(this.draftFeatures);

    if (this.draftFeatures.length < 1) {
      return;
    }

    const coords = this.draftFeatures[0].getGeometry().getCoordinates()[0];

    const updateDimPopup = (dimPopup, geometry) => {
      const basisVector = getOrthogonalBasisVector(...geometry.getCoordinates());

      let inputRotation = Math.asin(Math.abs(basisVector[1]));

      if (basisVector[1] < 0) {
        inputRotation = 2 * Math.PI - inputRotation;
      }

      dimPopup.setBaseRotation(inputRotation);
      dimPopup.setPosition(geometry.getCoordinateAt(0.5));
    };

    const xyRepeatGeometry = new LineString([coords[0], coords[2]], 'XY');
    updateDimPopup(this.XYRepeatPopup, xyRepeatGeometry);

    const xDimGeometry = new LineString([coords[0], coords[1]], 'XY');
    updateDimPopup(this.XDimPopup, xDimGeometry);

    const yDimGeometry = new LineString([coords[3], coords[4]], 'XY');
    updateDimPopup(this.YDimPopup, yDimGeometry);

    const getRotatedLineStringRelativeToOriginPoint = (startOffsets, endOffsets) => {
      const xStartOffsetVector = scaleVector(xBasisVector, startOffsets[0]);
      const yStartOffsetVector = scaleVector(yBasisVector, startOffsets[1]);

      const xEndOffsetVector = scaleVector(xBasisVector, endOffsets[0]);
      const yEndOffsetVector = scaleVector(yBasisVector, endOffsets[1]);

      const start = addVectors(originCoordinate, xStartOffsetVector, yStartOffsetVector);
      const end = addVectors(originCoordinate, xEndOffsetVector, yEndOffsetVector);

      return new LineString([start, end], 'XY');
    };

    const xIsleDimGeometry = getRotatedLineStringRelativeToOriginPoint(
      [this.xSize, 0], [this.xSize + this.xIsleSize, 0],
    );
    updateDimPopup(this.XIsleDimPopup, xIsleDimGeometry);

    const yIsleDimGeometry = getRotatedLineStringRelativeToOriginPoint(
      [0, this.ySize], [0, this.ySize + this.yIsleSize],
    );
    updateDimPopup(this.YIsleDimPopup, yIsleDimGeometry);
  }

  calculateLocalSphereNormalizationCoefficients(origin) {
    const mapViewProjCode = this.map.getView().getProjection().getCode();

    function asEpsg4326Coords(point) {
      return point
        .transform(mapViewProjCode, 'EPSG:4326')
        .getCoordinates();
    }

    function translateCopy(point, deltaX, deltaY) {
      const p = point.clone();
      p.translate(deltaX, deltaY);
      return p;
    }

    const originCoords = asEpsg4326Coords(origin.clone());
    const testXCoords = asEpsg4326Coords(translateCopy(origin, 1, 0));
    const testYCoords = asEpsg4326Coords(translateCopy(origin, 0, 1));

    return [
      1 / getSphericalDistance(originCoords, testXCoords),
      1 / getSphericalDistance(originCoords, testYCoords),
    ];
  }

  handleConfirmButtonClick() {
    this.dispatchEvent(new BedGeneratorEvent(
      BedGeneratorEventType.CONFIRM_BED_GEN, this.draftFeatures,
    ));
  }

  cancelDraft() {
    this.overlay.setMap(undefined);

    this.map.removeControl(this.unitSelect);
    this.map.removeControl(this.confirmButton);

    this.map.removeOverlay(this.XYRepeatPopup);

    this.map.removeOverlay(this.XDimPopup);
    this.map.removeOverlay(this.YDimPopup);

    this.map.removeOverlay(this.XIsleDimPopup);
    this.map.removeOverlay(this.YIsleDimPopup);
  }

}
