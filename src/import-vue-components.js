import Vue from 'vue';

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';

//Loosely based on https://github.com/vuejs/vuejs.org/blame/20926bf64c514ff2c7753776eb7dbf45dcbda88e/src/v2/guide/components-registration.md#L192-L229
export default function importAll (requireContext) {
  return requireContext.keys().map(fileName => {
    const componentConfig = requireContext(fileName);

    const componentName = upperFirst(
        camelCase(
          // Gets the file name regardless of folder depth
          fileName
            .split('/')
            .pop()
            .replace(/\.\w+$/, ''),
        ),
    );

    // Look for the component options on `.default`, which will
    // exist if the component was exported with `export default`,
    // otherwise fall back to module's root.
    const component = componentConfig.default || componentConfig;

    // Register component globally
    Vue.component(componentName, component);

    return component;
  });
}
