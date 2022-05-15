import Overlay from 'ol/Overlay';

/**
 * @private
 */
export default class HidableRotatedOverlay extends Overlay {
  /**
   * @param {Object=} optOptions Overlay options.
   */
  constructor(optOptions) {
    const options = optOptions || {};

    super(options);

    this.baseRotation = options.rotation || 0;
    this.rotateWithView = options.rotateWithView || false;
    this.rotationTransform = options.rotationTransform || (r => r);
  }

  /**
   * @inheritDoc
   * @api
   */
  setMap(map) {
    const oldMap = this.getMap();
    if (map === oldMap) {
      return;
    }
    if (this.onMapViewChanged && this.onMapViewChanged.target) {
      this.onMapViewChanged.target.un('change:view', this.onMapViewChanged.listener);
    }
    this.onMapViewChanged = null;
    super.setMap(map);

    if (map) {
      const updateRotationSubscription = () => {
        const newView = map.getView();

        if (this.onMapRotationChanged && this.onMapRotationChanged.target) {
          this.onMapRotationChanged.target.un('change:rotation', this.onMapRotationChanged.listener);
        }
        this.onMapRotationChanged = null;

        if (!this.rotateWithView) {
          this.updateRotation();
          return;
        }

        if (newView) {
          this.onMapRotationChanged = newView.on('change:rotation', () => this.updateRotation());
          this.updateRotation();
        }
      };

      this.onMapViewChanged = map.on('change:view', (viewChangeEvent) => {
        const oldView = viewChangeEvent.oldValue;
        const newView = map.getView();

        if (newView === oldView) {
          return;
        }

        updateRotationSubscription();
      });
      updateRotationSubscription();
    }
  }

  setBaseRotation(rotation) {
    this.baseRotation = rotation || 0;
    this.updateRotation();
  }

  hide() {
    this.element.style.display = 'none';
  }

  show() {
    this.element.style.display = 'block';
  }

  updateRotation() {
    const map = this.getMap();
    if (!map) {
      return;
    }
    const view = map.getView();
    if (!view) {
      return;
    }
    let rotation;
    if (this.rotateWithView) {
      rotation = (this.baseRotation + view.getRotation()) % (2 * Math.PI);
    } else {
      rotation = this.baseRotation % (2 * Math.PI);
    }

    rotation = this.rotationTransform(rotation);

    ['-webkit-transform', '-moz-transform', '-o-transform', '-ms-transform'].forEach((cssKey) => {
      const existingTransformCss = this.element.style[cssKey] || '';
      if (existingTransformCss.indexOf('rotate(')) {
        this.element.style[cssKey] = existingTransformCss.replace(/rotate\([^)]/, `rotate(${rotation}rad)`);
      } else {
        this.element.style[cssKey] = `rotate(${rotation}rad)`;
      }
    });
  }

}
