<template>
  <MountingPortal mountTo=".region-sticky__items__inner" append>
    <div>
      <ul class="local-actions">
        <li class="local-actions__item">
          <a v-if="hasUnsavedLandAssets" href="#" class="button button--primary" role="button" @click.prevent="$emit('save')">{{ saveText }}</a>
          <a v-else href="#" class="button button--primary is-disabled" role="button" disabled aria-disabled="true">{{ saveText }}</a>
        </li>
      </ul>
    </div>
  </MountingPortal>

</template>

<script>
export default {
  props: {
    unsavedLandAssetsVectorSource: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    saveText: Drupal.t("Save Land assets"),
  }),
  computed: {
    hasUnsavedLandAssets() {
      return this.unsavedLandAssetsVectorSource.getFeatures().length > 0;
    },
  },
};

</script>

<style scoped>

</style>