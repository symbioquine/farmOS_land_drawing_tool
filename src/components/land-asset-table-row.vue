<template>
  <tr class="planting-row"
        :class="{ 'asset-archived': value.archived }">
    <td v-for="field in fields" :key="field.fieldId" :class="field.fieldCellClasses">
      <div  ref="fieldComponents"
            :is="field"

            v-model="value"
            :is-unsaved="isUnsaved"

            :unsaved-land-assets-vector-source.sync="unsavedLandAssetsVectorSource"

            @focus="$emit('focus')"
            @blur="$emit('blur')"
      ></div>
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      required: true
    },
    isUnsaved: {
      type: Boolean,
      required: false,
    },

    fields: {
      type: Array,
      required: true,
    },

    unsavedLandAssetsVectorSource: {
      type: Object,
      required: true,
    },
  },
  methods: {
    validate() {
      if (!this.isUnsaved) {
        return;
      }

      const firstInvalidFieldError = this.$refs.fieldComponents.map((c) => {
        const fieldError = (typeof c.validate === 'function') && c.validate();
        c.$forceUpdate();
        return fieldError;
      }).find(e => e);

      return firstInvalidFieldError;
    },
  },
};


</script>

<style scoped>
  tr.planting-row.asset-archived {
    background-color: #A9A9A9;
  }
</style>
