<template>
  <div>
    <div v-if="!isUnsaved">
        {{ value.name }}
    </div>
    <div v-else>
      <input ref='input'
          v-model="value.name"
          placeholder="Unnamed Land Asset"
          @input="value.changed()"></input>
    </div>
  </div>
</template>

<script>
export default {
  fieldName: "Name",
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
}
</script>
