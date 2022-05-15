<template>
  <div>
    <MountingPortal v-if="paneRef" :mountTo="mountPoint" append>
      <slot :pane="paneRef"></slot>
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
    paneRef: undefined,
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

      const existingPane = this.mapInstance.sidePanel.getPaneById(this.paneId);

      // Only add the pane once
      if (existingPane) {
        this.paneRef = existingPane;
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

      this.paneRef = pane;
    };

    tryCreatingSidePane();
    this.mapInstance.map.getControls().on('add', tryCreatingSidePane);
  },
};

</script>
