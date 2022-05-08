<template>
  <svg :width="iconWidth" height="iconHeight" :viewBox="'0 0 ' + iconWidth + ' ' + iconHeight"
      style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
    <g v-for="svgElem, svgElemIdx in svgElements" :key="svgElem.id">
      <path v-if="svgElem.type == 'path'" :d="svgElem.shape" stroke="black" :fill="svgElem.fill" :fill-opacity="svgElem.fillOpacity" stroke-width="1" />
      <circle v-if="svgElem.type == 'circle'" :cx="svgElem.cx" :cy="svgElem.cy" :r="svgElem.r" stroke="black" :fill="svgElem.fill" :fill-opacity="svgElem.fillOpacity" stroke-width="1" />
    </g>
  </svg>
</template>

<script>
import {
  getBottomLeft as getExtentBottomLeft,
  getSize as getExtentSize,
} from 'ol/extent';

const SUBGEOMETRY_METHOD_BY_TYPE = {
    'GeometryCollection': 'getGeometries',
    'MultiPoint': 'getPoints',
    'MultiPolygon': 'getPolygons',
    'MultiLineString': 'getLineStrings',
};

const DEFAULT_ICON_WIDTH = 64;
const DEFAULT_ICON_HEIGHT = 64;

const ICON_MARGIN = 2;

export default {
  props: {
    value: {
      type: Object,
      required: true
    },
    iconWidth: {
      type: Number,
      default: DEFAULT_ICON_WIDTH
    },
    iconHeight: {
      type: Number,
      default: DEFAULT_ICON_HEIGHT
    },
  },
  computed: {
    maxIconLetterboxWidth() {
      return this.iconWidth - (2 * ICON_MARGIN);
    },
    maxIconLetterboxHeight() {
      return this.iconHeight - (2 * ICON_MARGIN);
    },
    svgElements() {
      let elems = [];

      const geom = this.value.getGeometry();

      if (!geom) {
        return [];
      }

      const overallExtent = geom.getExtent();

      const [extentWidth, extentHeight] = getExtentSize(overallExtent);

      const isLandscape = extentWidth > extentHeight;

      const aspectRatio = (extentHeight > 0) ? (extentWidth / extentHeight) : 1;

      const letterBoxWidth = isLandscape ? this.maxIconLetterboxWidth : (this.maxIconLetterboxWidth * aspectRatio);
      const letterBoxHeight = isLandscape ? (this.maxIconLetterboxHeight / aspectRatio) : this.maxIconLetterboxHeight;

      const letterBoxOffsets = {
        x: (this.iconWidth - letterBoxWidth) / 2,
        y: (this.iconHeight - letterBoxHeight) / 2,
      };

      const extentBottomLeft = getExtentBottomLeft(overallExtent);

      const getPosFromCoordinate = (c) => {
        if (extentWidth === 0 && extentHeight === 0) {
          return {x: this.iconWidth / 2, y: this.iconHeight / 2};
        }

        const relativeX = c[0] - extentBottomLeft[0];
        const relativeY = c[1] - extentBottomLeft[1];

        const posX = letterBoxOffsets.x + (relativeX / extentWidth) * letterBoxWidth;
        const posY = (this.iconHeight - letterBoxOffsets.y) - (relativeY / extentHeight) * letterBoxHeight;

        return {x: posX, y: posY};
      };

      const getPathShapeFromCoordinates = (coordinates, options) => {
        const opts = options || {};

        return coordinates.map((c, idx) => {
          const command = (idx === 0) ? 'M' : 'L';

          const pos = getPosFromCoordinate(c);

          return `${command} ${pos.x.toFixed(1)},${pos.y.toFixed(1)}`;
        }).join(' ') + (opts.close ? ' z' : '');
      };

      const getSvgElementsForGeometry = (geom) => {
        if (!geom || typeof geom.getType !== 'function') {
          return [];
        }

        if (geom.getType() === 'Point') {
          let pos = getPosFromCoordinate(geom.getCoordinates());

          return [{
            id: geom.ol_uid,
            type: 'circle',
            cx: pos.x,
            cy: pos.y,
            r: 2,
            fill: 'grey',
            fillOpacity: 1.0,
          }];
        }

        // Circle geometry type is omitted here since it isn't representable
        // in WKT or GeoJSON thus won't reach this code. But if we wanted to
        // support circles the code would be the same as that above for points,
        // except that the radius would be set to
        // `geom.getRadius() * (letterBoxWidth / extentWidth)`

        if (geom.getType() === 'Polygon') {
          if (geom.getLinearRingCount() < 1) {
            return []
          }

          return [{
            id: geom.ol_uid,
            type: 'path',
            shape: getPathShapeFromCoordinates(geom.getLinearRing(0).getCoordinates(), { close: true }),
            fill: 'grey',
            fillOpacity: 1.0,
          }];
        }

        if (geom.getType() === 'LineString') {
          return [{
            id: geom.ol_uid,
            type: 'path',
            shape: getPathShapeFromCoordinates(geom.getCoordinates(), { close: false }),
            fill: 'black',
            fillOpacity: 0.0,
          }];
        }

        if (SUBGEOMETRY_METHOD_BY_TYPE[geom.getType()]) {
          return geom[SUBGEOMETRY_METHOD_BY_TYPE[geom.getType()]]().flatMap((g) => getSvgElementsForGeometry(g));
        }

        return [];
      };

      return getSvgElementsForGeometry(geom);
    }
  },
}
</script>