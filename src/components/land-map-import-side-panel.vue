<template>
  <declarative-map-panel :map-instance="mapInstance" pane-id="import" :pane-name="importPaneTitle" :pane-icon="paneIcon()" :pane-weight="105">

    <div class="import-panel-container">

      <div class="import-file-selection">
          <button type="button" class="btn btn-default">{{ fileSelectionButtonLabel }}</button>
          <input name="import-map-data-input" type="file" accept=".json,.geojson,.kml,*/*" @input="onFileSelected($event)" />
      </div>

      <p class="import-error" v-if="importError">{{ importError }}</p>

      <v-select v-if="pendingImportFeatures.length > 0"
        v-model="pendingImportNameAttrKey"
        :options="pendingImportFeatureAttrKeys"
        :clearable="false"
      ></v-select>

      <div class="pending-import-features-table gin-table-scroll-wrapper" v-if="pendingImportFeatures.length > 0">

        <table class="table">
          <thead>
            <tr>
              <th class="text-left"></th>
              <th class="text-left"></th>
              <th class="text-left">
                {{ nameLabel }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="feature in pendingImportFeatures" :key="feature.ol_uid">
              <td><input type="checkbox" :value="feature" v-model="selectedImportFeatures"></td>
              <td><feature-geometry-icon :value="feature" :icon-width="32" :icon-height="32"></feature-geometry-icon></td>
              <td>{{ feature.get(pendingImportNameAttrKey) }}</td>
            </tr>
          </tbody>
        </table>

      </div>

      <button v-if="pendingImportFeatures.length > 0" type="button" class="import-confirm-button btn btn-default"  @click.prevent="importSelectedFeatures()">{{ importConfirmButtonLabel }}</button>
    </div>

  </declarative-map-panel>
</template>

<script>
import KML from 'ol/format/KML';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import { projection } from '@farmos.org/farmos-map';
import uploadIcon from 'bootstrap-icons/icons/upload.svg';

import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

const kml = new KML();
const geojson = new GeoJSON();

export default {
  components: {
    vSelect,
  },
  data: () => ({
    importError: '',

    pendingImportNameAttrKey: 'name',
    pendingImportFeatureAttrKeys: ['name'],
    pendingImportFeatures: [],
    selectedImportFeatures: [],

    // Translations
    importPaneTitle: Drupal.t('Import'),
    fileSelectionButtonLabel: Drupal.t('Choose file...'),
    nameLabel: Drupal.t('Name'),
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
  computed: {
    importConfirmButtonLabel() {
      return Drupal.t('Import @count item(s) to map (unsaved)', {'@count': this.selectedImportFeatures.length});
    },
  },
  methods: {
    paneIcon() {
      return uploadIcon;
    },
    onFileSelected: async function (event) {
      const inputRef = event.target;

      const file = inputRef.files[0];

      if (!file) {
        inputRef.value = '';
        return;
      }

      const fileToText = data => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsText(data);
      });

      const fileName = file.name;
      const fileType = file.type;
      const fileSize = file.size;
      const fileData = await fileToText(file);

      inputRef.value = '';

      try {
        if (fileName.endsWith('kml')) {
          this.pendingImportFeatures = kml.readFeatures(fileData, projection);
        } else if (fileName.endsWith('json') || fileName.endsWith('geojson')) {
          this.pendingImportFeatures = geojson.readFeatures(fileData, projection);
        } else {
          throw new Error(Drupal.t('Selected file "@fileName" has an unsupported extension.', {'@fileName': fileName}));
        }
      } catch(e) {
        this.importError = Drupal.t('Import failed: @reason', {'@reason': e.message});
        return;
      }

      this.selectedImportFeatures = this.pendingImportFeatures.slice(0);

      this.pendingImportFeatureAttrKeys = this.pendingImportFeatures[0].getKeys();
    },
    importSelectedFeatures() {
      const selectedImportFeatures = this.selectedImportFeatures;
      this.pendingImportFeatures = [];
      this.selectedImportFeatures = [];

      this.unsavedLandAssetsVectorSource.addFeatures(selectedImportFeatures.map(f => {
        return new Feature({
          name: f.get(this.pendingImportNameAttrKey),
          land_type: undefined,
          geometry: f.getGeometry(),
        });
      }));

      this.pendingImportNameAttrKey = 'name';
      this.pendingImportFeatureAttrKeys = ['name'];
    },
  },
};

</script>

<style scoped>
.import-panel-container {
  position: absolute;
  height: calc(100% - 50px);
  width: 100%;
  margin: 0px;
  padding: 0px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
p.import-error {
  width: 80%;
  color: #9f3333;
}
.import-file-selection {
    position: relative;
    display: inline-block;
    width: 100%;
    font: normal 14px Myriad Pro, Verdana, Geneva, sans-serif;
    color: #7f7f7f;
    margin-top: 4px;
    margin-bottom: 4px;
    background: white
}
.import-file-selection button {
    display: inline-block;
    width: 100%;
}
.import-file-selection input[type="file"]{
    -webkit-appearance:none;
    position:absolute;
    top:0;
    left:0;
    opacity:0;
    width: 100%;
    height: 100%;
}
div.pending-import-features-table {
  display: block;
  flex-grow: 1;
}
div.pending-import-features-table table {
  margin-top: 8px;
}
div.pending-import-features-table td {
  height: 2rem;
  padding: 4px;
}
div.pending-import-features-table th {
  height: 2rem;
  padding: 4px;
}
button.import-confirm-button {
    width: 100%;
    height: 26.5px;
    flex-shrink: 0;
    background: white;
}
</style>
