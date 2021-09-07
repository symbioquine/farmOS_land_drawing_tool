<template>
  <div class="farm-land-map" ref="map-container-div"></div>
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
  },
  mounted: function () {
    const vm = this;

    // Code that will run only after the
    // entire view has been rendered
    this.$nextTick(() => {

      const mapPrototypeElement = document.getElementById('farm-land-drawing-tool-map-prototype');
      mapPrototypeElement.style.display = 'none';

      const mapElement = mapPrototypeElement.cloneNode();
      mapElement.removeAttribute('id');
      mapElement.style.display = 'block';

      this.$refs['map-container-div'].appendChild(mapElement);

      vm.mapInstance = Drupal.behaviors.farm_map.createMapInstance(mapElement, mapElement, 'farm-land-drawing-tool-map-prototype', {});

      const textStyleFn = (feature) => {
        return new Text({
          text: feature.get('name') || Drupal.t('Unnamed Land Asset'),
          font: '10px Calibri,sans-serif',
          overflow: true,
          textAlign: 'start',
          offsetX: 10,
          offsetY: 2,
          stroke: new Stroke({
            color: '#8A8A8A',
            width: 1
          })
        });
      };

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
            text: showText ? textStyleFn(feature) : undefined,
            zIndex: zIndex,
          })
        ];
      };

      vm.unsavedLandAssetsLayer = new VectorLayer({
        title: Drupal.t("Unsaved Land Assets"),
        source: vm.unsavedLandAssetsVectorSource,
        style: styleFn,
        declutter: false,
      });

      vm.mapInstance.map.addLayer(vm.unsavedLandAssetsLayer);

      vm.mapInstance.addBehavior('edit', { layer: vm.unsavedLandAssetsLayer });
      vm.mapInstance.addBehavior('measure', { layer: vm.unsavedLandAssetsLayer });
      vm.mapInstance.addBehavior('snappingGrid');

      this.mapInstance.map.getLayers().on('add', evt => {
        const layer = evt.element;

        if (layer.get('title') !== 'All locations') {
          return;
        }

        const existingStyleFn = layer.getStyleFunction();

        const decoratedStyleFn = (f) => {
          const styles = [].concat(existingStyleFn(f));

          const exstingTextStyle = styles.map(s => s.getText()).find(t => t);

          if (!exstingTextStyle) {
            styles.push(new Style({
              text: textStyleFn(f),
            }));
          }

          return styles;
        };

        layer.setStyle(decoratedStyleFn);
      });
    });
  },
  methods: {
    refreshAssetTypeLayers() {
      const allLocationsAssetTypeLayer = this.mapInstance.map.getLayers().getArray().find(layer => layer.get('title') == 'All locations');

      if (allLocationsAssetTypeLayer) {
        allLocationsAssetTypeLayer.getSource().refresh();
      }
    },
  },
};

</script>

<style>
div.farm-land-map div.ol-control.ol-edit {
  top: 5.5em;
}
</style>
