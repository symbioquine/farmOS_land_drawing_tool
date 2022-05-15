import Collection from 'ol/Collection';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import EventType from 'ol/events/EventType';
import {
  Circle as CircleStyle,
  Icon,
  Fill,
  Style,
} from 'ol/style';
import Draw from 'ol/interaction/Draw';
import Interaction from 'ol/interaction/Interaction';
import Snap from 'ol/interaction/Snap';
import Translate from 'ol/interaction/Translate';

// Using raw-loader here since the svg loader wasn't preserving the svg size attributes
/* eslint-disable-next-line import/no-webpack-loader-syntax,import/no-unresolved */
import bullseyeIcon from '!!raw-loader!bootstrap-icons/icons/bullseye.svg';
/* eslint-disable-next-line import/no-webpack-loader-syntax,import/no-unresolved */
import arrowClockwiseIcon from '!!raw-loader!bootstrap-icons/icons/arrow-clockwise.svg';


import ButtonControl from './button-control';
import './bed-generator-workflow.css';
import forEachLayer from './forEachLayer';
import {
  BedGeneratorFeatureDraftingState,
  BedGeneratorEventType,
} from './bed-generator-feature-drafting-state';

/**
 * @classdesc
 * OpenLayers BedGeneratorWorkflow Interaction.
 *
 * @api
 */
export default class BedGeneratorWorkflow extends Interaction {

  /**
   * @param {Options=} opts BedGeneratorWorkflow options.
   */
  constructor(opts) {
    const options = opts || {};

    // Call the parent interaction constructor.
    super();

    this.units = options.units;
    this.unsavedLandAssetsVectorSource = options.unsavedLandAssetsVectorSource;

    this.controlPointStyle = new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: '#c7c7c7' }),
      }),
    });

    // Internal vector layer used for drawing the control points (origin/rotation-anchor)
    this.workflowControlPointsVectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [],
        wrapX: false,
      }),
      style: this.controlPointStyle,
    });

    this.workflowControlPointsVectorLayer.getSource().on('addfeature', this.handleAddWorkflowControlFeature.bind(this));

    this.documentKeyPressHandler = this.handleDocumentKeypress.bind(this);
  }

  /**
   * @inheritDoc
   * @api
   */
  setMap(map) {
    const oldMap = this.getMap();
    if (map === oldMap) {
      return;
    }
    super.setMap(map);
    if (oldMap) {
      document.removeEventListener(EventType.KEYDOWN, this.documentKeyPressHandler, false);

      oldMap.getTargetElement().classList.remove('bed-generator-active');

      oldMap.removeLayer(this.workflowControlPointsVectorLayer);

      if (this.drawWorkflowAnchorsInteraction) {
        oldMap.removeInteraction(this.drawWorkflowAnchorsInteraction);
        this.drawWorkflowAnchorsInteraction = undefined;
      }

      this.clearSnap(oldMap);

      if (this.moveWorkflowAnchorsInteraction) {
        oldMap.removeInteraction(this.moveWorkflowAnchorsInteraction);
        this.moveWorkflowAnchorsInteraction = undefined;
      }

      if (this.cancelButton) {
        oldMap.removeControl(this.cancelButton);
        this.cancelButton = undefined;
      }
      if (this.draftingState) {
        this.draftingState.cancelDraft();
        this.draftingState = undefined;
      }
    }
    if (map && this.getActive()) {
      document.addEventListener(EventType.KEYDOWN, this.documentKeyPressHandler, false);

      map.addLayer(this.workflowControlPointsVectorLayer);

      this.resetWorkflowState();
    }
  }

  resetWorkflowState() {
    this.getMap().getTargetElement().classList.add('bed-generator-active');

    // Create the draw interaction and add it to the map.
    this.drawWorkflowAnchorsInteraction = new Draw({
      source: this.workflowControlPointsVectorLayer.getSource(),
      type: 'Point',
    });

    this.getMap().addInteraction(this.drawWorkflowAnchorsInteraction);
    this.enableSnap();

    this.cancelButton = new ButtonControl({
      className: 'cancel-bed-generator',
      label: 'X',
    });
    this.cancelButton.on('click', () => this.handleCancelButtonClick());
    this.getMap().addControl(this.cancelButton);
  }

  /**
   * Enable snap interaction for drawing the control points.
   * @private
   */
  enableSnap() {
    this.clearSnap(this.getMap());

    this.snapInteraction = new Snap({
      features: new Collection(),
    });

    // Load all vector layer features in the map and add them to the snap
    // interaction's feature collection (so they can be snapped to).
    forEachLayer(this.getMap().getLayerGroup(), (layer) => {
      if (typeof layer.getSource === 'function') {
        const source = layer.getSource();
        if (source && typeof source.getFeatures === 'function') {
          const features = source.getFeatures();
          if (source.getState() === 'ready' && features.length > 0) {
            features.forEach((feature) => {
              this.snapInteraction.addFeature(feature);
            });
          }
        }
      }
    });

    this.getMap().addInteraction(this.snapInteraction);
  }

  clearSnap(map) {
    if (this.snapInteraction) {
      map.removeInteraction(this.snapInteraction);
      this.snapInteraction = null;
    }
  }

  /**
   * Callback for escape key press. Deactivate grid control point draw interaction - if active.
   * @param {KeyboardEvent} event The event to handle
   * @private
   */
  handleDocumentKeypress(event) {
    if (event.key === 'Escape') {
      this.getMap().removeInteraction(this);
    }
  }

  handleCancelButtonClick() {
    this.getMap().removeInteraction(this);
  }

  /**
   * Handle features added to the workflow control points layer - activates the drafting state once
   * two points are added.
   * @private
   */
  handleAddWorkflowControlFeature() {
    const map = this.getMap();

    const features = this.workflowControlPointsVectorLayer.getSource().getFeatures();

    const svgIconStyle = svg => new Style({
      image: new Icon({
        opacity: 1,
        src: `data:image/svg+xml;utf8,${escape(svg)}`,
        scale: 1,
      }),
    });

    if (features.length === 1) {
      features[0].set('controlPointType', 'origin');
      features[0].setStyle([this.controlPointStyle, svgIconStyle(bullseyeIcon)]);
    }

    if (features.length === 2) {
      features[1].set('controlPointType', 'rotation');
      features[1].setStyle([this.controlPointStyle, svgIconStyle(arrowClockwiseIcon)]);
    }

    if (features.length !== 2) {
      return;
    }

    map.removeInteraction(this.drawWorkflowAnchorsInteraction);

    this.moveWorkflowAnchorsInteraction = new Translate({
      layers: [this.workflowControlPointsVectorLayer],
    });

    map.addInteraction(this.moveWorkflowAnchorsInteraction);

    this.enableSnap();

    this.draftingState = new BedGeneratorFeatureDraftingState({
      map,
      units: this.units,
      workflowControlPointsVectorLayer: this.workflowControlPointsVectorLayer,
    });

    this.draftingState.once(BedGeneratorEventType.CONFIRM_BED_GEN, e => this.handleDrawEnd(e));
  }

  handleDrawEnd(event) {
    this.unsavedLandAssetsVectorSource.addFeatures(event.features);
    this.getMap().removeInteraction(this);
  }

}
