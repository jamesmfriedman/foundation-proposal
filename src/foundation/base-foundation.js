/**
 * a quick and dirty base class for foundations to extend
 * stash reusable logic in here...
 */

import { Element } from './element';

export class Foundation {
  onChangeEnabled = true;

  createEl(...args) {
    const el = new Element(...args);
    el.onChange = (...args) => {
      this.onChangeEnabled && this.onChange(...args);
    };
    return el;
  }

  attachToDom(root) {
    console.log('Not implemented: Should be overwritten in subclasses');
  }
}
