<template>
  <div class="land-asset-drawing-tool">
    <local-actions-save-button
      :unsaved-land-assets-vector-source.sync="unsavedLandAssetsVectorSource"
      @save="saveLandAssets"
    ></local-actions-save-button>
    <land-map
       ref="landMap"
       :unsaved-land-assets-vector-source.sync="unsavedLandAssetsVectorSource"
    ></land-map>
    <land-asset-table ref="plantingTable"
      :fields="fields"

      :unsaved-land-assets-vector-source.sync="unsavedLandAssetsVectorSource"

      :recently-created-land-assets="recentlyCreatedLandAssets"
    ></land-asset-table>
  </div>
</template>

<script>
import axios from 'axios';
import Vue from 'vue';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';

import { projection } from '@farmos.org/farmos-map';

import importAll from './import-vue-components';

const fields = importAll(require.context('./fields/', true, /\.vue$/));


export default {
  data: () => ({
    fields: orderedByWeight(fields),
    unsavedLandAssetsVectorSource: new VectorSource(),
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

      Promise.all(savePromises).finally(() => {
        this.$asyncComputed.recentlyCreatedLandAssets.update();
        // this.existingLandAssetsVectorSource.refresh();
        this.$refs.landMap.refreshAssetTypeLayers();
      });
    },
    async saveFeatureAsLandAsset(f, antiCsrfToken) {
	  const { default: WKT } = await import('ol/format/WKT');

	  /* eslint-disable-next-line no-console,no-undef */
	  console.log(__webpack_public_path__);

	  const wkt = new WKT();

      const postResponse = await axios.post(createUrl('/api/asset/land'), {
        data: {
          type: "asset--land",
          attributes: {
            name: f.get('name') || Drupal.t('Unnamed Land Asset'),
            land_type: f.get('land_type') || Drupal.t('other'),
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