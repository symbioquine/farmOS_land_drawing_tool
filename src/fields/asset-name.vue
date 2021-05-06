<template>
  <div>
    <div v-if="!isUnsaved">
        {{ value.get('name') }}
    </div>
    <div v-else>
      <input ref='input'
          :value="value.get('name')"
          @input="value.set('name', $event.target.value)"
          placeholder="Unnamed Land Asset"
      ></input>
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
