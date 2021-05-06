<template>
  <div class="farm-map" style="height: 460px;" ref="map-div"></div>
</template>

<script>
import Vue from 'vue';

import VectorLayer from 'ol/layer/Vector';

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

      vm.unsavedLandAssetsLayer = new VectorLayer({
        title: "Unsaved Land Assets",
        source: vm.unsavedLandAssetsVectorSource,
        declutter: false,
      });

      vm.existingLandAssetsLayer = new VectorLayer({
        title: "Existing Land Assets",
        source: vm.existingLandAssetsVectorSource,
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
