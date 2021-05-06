<template>
  <div class="farm-map" style="height: 460px;" ref="map-div"></div>
</template>

<script>
import Vue from 'vue';

import VectorLayer from 'ol/layer/Vector';
import {
  Circle,
  Fill,
  Stroke,
  Style,
  Text,
} from 'ol/style';

export default {
  props: {
    unsavedLandAssetsVectorSource: {
      type: Object,
      required: true,
    },
    existingLandAssetsVectorSource: {
      type: Object,
      required: true,
    },
  },
  mounted: function () {
    const vm = this;

    this.$nextTick(() => {

      // Get the units.
      let units = 'metric';
      if (!!drupalSettings.farm_map.units) {
        units = drupalSettings.farm_map.units;
      }

      // Code that will run only after the
      // entire view has been rendered
      vm.mapInstance = farmOS.map.create(this.$refs['map-div'], {
          units,
      });

      const styleFn = function(feature) {
        const isHighlighted = (f) => f.get('mouseOver') || f.get('hasFocus');

        const highlighted = isHighlighted(feature);

        const zIndex = highlighted ? Infinity : 10;
        const strokeColor = highlighted ? '#FF99CC' : '#3399CC';
        const textStrokeColor = highlighted ? '#FFF' : '#8A8A8A';

        const anyFeaturesHighlighted =
          vm.unsavedLandAssetsVectorSource.getFeatures().some(isHighlighted);

        const showText = !anyFeaturesHighlighted || highlighted;

        const fill = new Fill({
          color: 'rgba(255,255,255,0.4)'
        });
        const stroke = new Stroke({
          color: strokeColor,
          width: 1.25
        });
        return [
          new Style({
            image: new Circle({
              fill: fill,
              stroke: stroke,
              radius: 5
            }),
            fill: fill,
            stroke: stroke,
            text: showText ? new Text({
              text: feature.get('name') || 'Unnamed Land Asset',
              font: '10px Calibri,sans-serif',
              overflow: true,
              textAlign: 'start',
              offsetX: 10,
              offsetY: 2,
              stroke: new Stroke({
                color: '#8A8A8A',
                width: 1
              })
            }) : undefined,
            zIndex: zIndex,
          })
        ];
      };

      vm.unsavedLandAssetsLayer = new VectorLayer({
        title: "Unsaved Land Assets",
        source: vm.unsavedLandAssetsVectorSource,
        style: styleFn,
        declutter: false,
      });

      vm.existingLandAssetsLayer = new VectorLayer({
        title: "Existing Land Assets",
        source: vm.existingLandAssetsVectorSource,
        style: styleFn,
        declutter: false,
      });

      vm.mapInstance.map.addLayer(vm.unsavedLandAssetsLayer);
      vm.mapInstance.map.addLayer(vm.existingLandAssetsLayer);

      vm.mapInstance.addBehavior('edit', { layer: vm.unsavedLandAssetsLayer });
      vm.mapInstance.addBehavior('snappingGrid');

      // Zoom to the existing land geometries once they load
      vm.existingLandAssetsVectorSource.on('change', function () {
        vm.mapInstance.zoomToVectors();
      });

    });
  },
};

</script>

<style>
div.farm-map div.ol-control.ol-edit {
  top: 5.5em;
}
</style>
