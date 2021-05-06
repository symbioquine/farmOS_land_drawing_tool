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

      :recently-created-land-assets="recentlyCreatedLandAssets"
    ></land-asset-table>
    <bottom-bar
      :unsaved-land-assets-vector-source.sync="unsavedLandAssetsVectorSource"
      @save="saveLandAssets"
    ></bottom-bar>
  </div>
</template>

<script>
import axios from 'axios';
import Vue from 'vue';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';
import Feature from 'ol/Feature';

import projection from 'farmOS-map/src/projection';

import importAll from './import-vue-components';

const fields = importAll(require.context('./fields/', true, /\.vue$/));


const wkt = new WKT();


export default {
  data: () => ({
    fields: orderedByWeight(fields),
    unsavedLandAssetsVectorSource: new VectorSource(),
    existingLandAssetsVectorSource: new VectorSource({
      format: new GeoJSON(),
      url: createUrl('/assets/geojson/full/land?is_location=1'),
    }),
  }),
  asyncComputed: {
    recentlyCreatedLandAssets: {
      async get() {
        const result = await axios.get(createUrl('/api/asset/land?is_location=1&is_fixed=1&sort=-revision_created'));
        return result.data.data.map((raw_asset) => {
          return new Feature({
            name: raw_asset.attributes.name,
            land_type: raw_asset.attributes.land_type,
          });
        });
      },
      default: [],
    },
  },
  methods: {
    async saveLandAssets() {
      const tokenResponse = await axios.get(createUrl('/session/token'));

      const savePromises = this.unsavedLandAssetsVectorSource.getFeatures().map(f => this.saveFeatureAsLandAsset(f, tokenResponse.data));

      Promise.all(savePromises).finally(() => this.$asyncComputed.recentlyCreatedLandAssets.update());
    },
    async saveFeatureAsLandAsset(f, antiCsrfToken) {

      const postResponse = await axios.post(createUrl('/api/asset/land'), {
        data: {
          type: "asset--land",
          attributes: {
            name: f.get('name') || 'Unnamed Land Asset',
            land_type: f.get('land_type') || 'other',
            intrinsic_geometry: wkt.writeGeometry(f.getGeometry(), projection),
          },
        },
      }, {
        headers: {
          'content-type': 'application/vnd.api+json',
          'X-CSRF-Token': antiCsrfToken,
        },
      });

      this.unsavedLandAssetsVectorSource.removeFeature(f);
    },
  },
};

function createUrl(pathSuffix) {
  return new URL(pathSuffix, window.location.origin + drupalSettings.path.baseUrl);
}

function orderedByWeight(fields) {
  return fields.concat().sort((a, b) => a.fieldWeight - b.fieldWeight);
}
</script>

<style scoped>

</style>