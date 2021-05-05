<template>
    <div class="form-wrapper form-actions">
      <a v-if="hasUnsavedLandAssets" href="#" class="button button--primary" role="button" @click.prevent="$emit('save')">Save Land Assets</a>
      <a v-else href="#" class="button button--primary is-disabled" role="button" disabled aria-disabled="true">Save Land Assets</a>
    </div>
</template>

<script>
export default {
  props: {
    unsavedLandAssetsVectorSource: {
      type: Object,
      required: true,
    },
  },
  computed: {
    hasUnsavedLandAssets() {
      return this.unsavedLandAssetsVectorSource.getFeatures().length > 0;
    },
  },
};

</script>
