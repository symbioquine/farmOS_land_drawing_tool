<template>
  <div>
    <div v-if="!isUnsaved">
        {{ value.get('name') }}
    </div>
    <div v-else>
      <input ref='input'
          :value="value.get('name')"
          @input="value.set('name', $event.target.value)"
          :placeholder="namePlaceholderText"
          @focus="$emit('focus')"
          @blur="$emit('blur')"
      ></input>
    </div>
  </div>
</template>

<script>
export default {
  fieldName: Drupal.t("Name"),
  fieldWeight: 1,
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
  data: () => ({
    namePlaceholderText: Drupal.t('Unnamed Land Asset'),
  }),
}
</script>
