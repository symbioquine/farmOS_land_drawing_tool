<template>
  <div class="land-asset-drawing-tool">
    <land-map
       :unsaved-land-assets-vector-source.sync="unsavedLandAssetsVectorSource"
       :existing-land-assets-vector-source="existingLandAssetsVectorSource"
    ></land-map>
    <land-asset-table ref="plantingTable"
      :fields="fields"

      :unsaved-land-assets-vector-source.sync="unsavedLandAssetsVectorSource"
      :existing-land-assets-vector-source="existingLandAssetsVectorSource"
    ></land-asset-table>
  </div>
</template>

<script>
import Vue from 'vue';

import VectorSource from 'ol/source/Vector';

import importAll from './import-vue-components';

const fields = importAll(require.context('./fields/', true, /\.vue$/));

export default {
  data: () => ({
    fields: orderedByWeight(fields),
    unsavedLandAssetsVectorSource: new VectorSource(),
    existingLandAssetsVectorSource: new VectorSource(),
  }),
};

function orderedByWeight(fields) {
  return fields.concat().sort((a, b) => a.fieldWeight - b.fieldWeight);
}
</script>

<style scoped>

</style>