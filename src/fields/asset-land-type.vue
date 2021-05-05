<template>
  <div>
    <div v-if="!isUnsaved">
      {{ value.get('land_type') }}
    </div>
    <div v-else>
      <v-select
        placeholder="Other"
        :options="landTypeOptions"
        :reduce="o => o.id"
        :value="value.get('land_type')"
        @input="value.set('land_type', $event)"
      ></v-select>
    </div>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';


export default {
  components: {
    vSelect,
  },
  fieldName: "Type",
  fieldWeight: 2,
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
    landTypeOptions: Object.entries(drupalSettings.farmos_land_drawing_tool.land_type_options).map(o => ({id: o[0], label: o[1]})),
  }),
}
</script>
