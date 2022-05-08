<template>
  <div>
    <MountingPortal v-if="paneAdded" :mountTo="mountPoint" append>
      <slot></slot>
    </MountingPortal>
  </div>
</template>

<script>
export default {
  props: {
    mapInstance: {
      type: Object,
      required: true,
    },
    paneId: {
      type: String,
      required: true,
    },
    paneName: {
      type: String,
      required: true,
    },
    paneIcon: {
      type: String,
      required: true,
    },
    paneWeight: {
      type: Number,
      required: false,
    },
  },
  data: () => ({
    paneAdded: false,
  }),
  computed: {
    mountPoint() {
      return `.${this.paneId}-pane-container`;
    },
  },
  mounted: function () {
    const tryCreatingSidePane = () => {
      if (!this.mapInstance.sidePanel) {
        return;
      }

      const existingImportPane = this.mapInstance.sidePanel.getPaneById('import');

      // Only add the import pane once
      if (existingImportPane) {
        this.paneAdded = true;
        return;
      }

      const pane = this.mapInstance.sidePanel.definePane({
        paneId: this.paneId,
        name: this.paneName,
        icon: this.paneIcon,
        weight: this.paneWeight,
      });

      const paneContainerDiv = document.createElement('div');
      paneContainerDiv.classList = `${this.paneId}-pane-container`;

      pane.addWidgetElement(paneContainerDiv);

      this.paneAdded = true;
    };

    tryCreatingSidePane();
    this.mapInstance.map.getControls().on('add', tryCreatingSidePane);
  },
};

</script>
