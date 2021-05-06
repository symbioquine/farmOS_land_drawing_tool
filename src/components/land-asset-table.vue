<template>
    <div class="gin-table-scroll-wrapper" style="width: calc(100vw - (100vw - 100%));">
      <table class="table">
        <thead>
          <tr>
            <th v-for="field in fields" :key="field.fieldId" :class="field.fieldCellClasses">{{ field.fieldName }}</th>
          </tr>
        </thead>
        <tbody>
          <land-asset-table-row ref="rows"
                v-for="feature, featureIdx in features" :key="feature.ol_uid"

                v-model="features[featureIdx]"
                :is-unsaved="unsavedLandAssetsVectorSource.hasFeature(feature)"

                :fields="fields"

                :unsaved-land-assets-vector-source.sync="unsavedLandAssetsVectorSource"

                @mouseover.native="feature.set('mouseOver', true)"
                @mouseleave.native="feature.set('mouseOver', false)"

                @focus="feature.set('hasFocus', true)"
                @blur="feature.set('hasFocus', false)"
          ></land-asset-table-row>
        </tbody>
      </table>

    </div>
</template>

<script>
export default {
  props: {
    fields: {
      type: Array,
      required: true,
    },
    unsavedLandAssetsVectorSource: {
      type: Object,
      required: true,
    },
    recentlyCreatedLandAssets: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
  }),
  computed: {
    features() {
      return [
        ...this.unsavedLandAssetsVectorSource.getFeatures(),
        ...this.recentlyCreatedLandAssets,
      ];
    },
  },
  methods: {
    validate() {
      return this.$refs.rows.map((row) => row.validate()).find(e => e);
    },
  },
};

</script>

<style scoped>
  th {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: #DCDCDC;
  }
  table {
  }
</style>
