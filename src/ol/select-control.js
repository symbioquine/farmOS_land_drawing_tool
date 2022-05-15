import { Control } from 'ol/control';
import { CLASS_CONTROL, CLASS_UNSELECTABLE } from 'ol/css';


/**
 * @private
 */
export default class SelectControl extends Control {
  /**
   * @param {Object=} optOptions Control options.
   */
  constructor(optOptions) {
    const options = optOptions || {};

    const className = options.className || '';

    const select = document.createElement('select');

    const addOption = (value) => {
      const option = document.createElement('option');
      option.innerHTML = value;
      option.value = value;
      select.appendChild(option);
    };

    const optionValues = (options.optionValues || []);

    optionValues.forEach(v => addOption(v));

    const element = document.createElement('div');
    element.className = `${className} ol-select-control ${CLASS_UNSELECTABLE} ${CLASS_CONTROL}`;
    element.appendChild(select);

    super({
      element,
      target: options.target,
    });

    select.addEventListener('change', () => this.set('selection', select.value), false);

    select.value = options.selectedOption || optionValues[0];

    this.set('selection', select.value);
  }

}
