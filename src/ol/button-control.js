import { Control } from 'ol/control';
import { CLASS_CONTROL, CLASS_UNSELECTABLE } from 'ol/css';


export default class ButtonControl extends Control {
  /**
   * @param {Object=} optOptions Control options.
   */
  constructor(optOptions) {
    const options = optOptions || {};

    const className = options.className || '';

    const button = document.createElement('button');
    button.innerHTML = options.label || '?';

    const element = document.createElement('div');
    element.className = `${className} ol-button-control ${CLASS_UNSELECTABLE} ${CLASS_CONTROL}`;
    element.appendChild(button);

    super({
      element,
      target: options.target,
    });

    button.addEventListener('click', this.handleClick.bind(this), false);
  }

  handleClick() {
    this.dispatchEvent('click');
  }
}
