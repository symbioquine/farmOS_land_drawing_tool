<template>
  <div class="farm-map" style="height: 40vh;" ref="map-div"></div>
</template>

<script>
import Vue from 'vue';

export default {
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

    });
  },
};

</script>
