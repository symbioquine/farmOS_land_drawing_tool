<template>
  <div>
    <feature-geometry-icon :value="value"></feature-geometry-icon>
  </div>
</template>

<script>
export default {
  fieldName: Drupal.t("Icon"),
  fieldWeight: 1,
  fieldCellClasses: 'asset-icon-field',
  props: {
    value: {
      type: Object,
      required: true
    },
    isUnsaved: {
      type: Boolean,
      required: false,
    },
  },
}
</script>

<style>
.asset-icon-field {
    width: 64px;
}
</style>
