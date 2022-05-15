<template>
  <declarative-map-panel :map-instance="mapInstance" pane-id="bed-generator" :pane-name="bedGeneratorPaneTitle" :pane-icon="paneIcon()" :pane-weight="103" v-slot="{ pane }">

    <div class="bed-generator-panel-container">

      <div class="bed-generator-help-info">
        <p>{{ bedGeneratorHelpParagraph1 }}</p>

        <p>{{ bedGeneratorHelpParagraph2 }}</p>

        <p>{{ bedGeneratorHelpParagraph3 }}</p>
      </div>

      <button type="button"
        class="start-bed-generator-button btn btn-default"
        @click.prevent="startBedGeneratorWorkflow(pane)"
        >{{ startBedGeneratorButtonLabel }}</button>
    </div>

  </declarative-map-panel>
</template>

<script>
import Feature from 'ol/Feature';
import { projection } from '@farmos.org/farmos-map';
import gridFillIcon from 'bootstrap-icons/icons/grid-fill.svg';

import BedGeneratorWorkflow from '../ol/bed-generator-workflow';


export default {
  data: () => ({
    // Translations
    bedGeneratorPaneTitle: Drupal.t('Generate Beds'),
    startBedGeneratorButtonLabel: Drupal.t('Start bed generator'),

    bedGeneratorHelpParagraph1: Drupal.t('The bed generator works by selecting two points which we\'ll call "anchors". The first of these, the "origin anchor", describes where the first corner of the first bed is located. The second anchor, the "rotation anchor", describes how the beds are rotated on the map.'),
    bedGeneratorHelpParagraph2: Drupal.t('Once the two anchors have been selected, the bed generator will display a preview of the beds and a number of input boxes that affect the quantity, dimensions, and spacing of the beds.'),
    bedGeneratorHelpParagraph3: Drupal.t('While the bed generator is active, the normal drawing controls are hidden. Either complete or cancel the bed generator workflow to return to the normal drawing workflow.'),
  }),
  props: {
    mapInstance: {
      type: Object,
      required: true,
    },
    unsavedLandAssetsVectorSource: {
      type: Object,
      required: true,
    },
  },
  methods: {
    paneIcon() {
      return gridFillIcon;
    },
    startBedGeneratorWorkflow: async function (pane) {
      pane.set('active', false);

      const workflow = new BedGeneratorWorkflow({
        units: this.mapInstance.units,
        unsavedLandAssetsVectorSource: this.unsavedLandAssetsVectorSource,
      });
      workflow.setActive(true);

      this.mapInstance.map.addInteraction(workflow);
    },
  },
};

</script>

<style scoped>
.bed-generator-panel-container {
  position: absolute;
  height: calc(100% - 50px);
  width: calc(100% - 20px);
  margin: 0px;
  padding: 0px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.bed-generator-help-info {
  display: block;
  flex-grow: 1;
  overflow: auto;
  padding-right: 10px;
}
button.start-bed-generator-button {
    width: 85%;
    margin-right: 100px;
    height: 26.5px;
    flex-shrink: 0;
    background: white;
}
</style>
