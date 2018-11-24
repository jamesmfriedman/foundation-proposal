/**
 * This is the Vanilla JS version of the checkbox
 * Other than the constructor, there really isn't much to set up
 * The getter / setter api was copied over from the current index.js file
 *
 * Look at the component base class...
 */

import { Component } from './component';
import { CheckboxFoundation } from '../foundation/checkbox-foundation';

export class Checkbox extends Component {
  foundation = new CheckboxFoundation();

  constructor(domNode) {
    super();
    this.onChange = this.onChange.bind(this);
    this.foundation.onChange = this.onChange;

    this.foundation.attachToDom(domNode);
    this.foundation.init();
  }

  /** @return {boolean} */
  get checked() {
    return this.foundation.nativeControl.domNode.checked;
  }

  /** @param {boolean} checked */
  set checked(checked) {
    this.foundation.nativeControl.domNode.checked = checked;
  }

  /** @return {boolean} */
  get indeterminate() {
    return this.foundation.nativeControl.domNode.indeterminate;
  }

  /** @param {boolean} indeterminate */
  set indeterminate(indeterminate) {
    this.foundation.nativeControl.domNode.indeterminate = indeterminate;
  }

  /** @return {boolean} */
  get disabled() {
    return this.foundation.nativeControl.domNode.disabled;
  }

  /** @param {boolean} disabled */
  set disabled(disabled) {
    this.foundation_.setDisabled(disabled);
  }

  /** @return {?string} */
  get value() {
    return this.foundation.nativeControl.domNode.value;
  }

  /** @param {?string} value */
  set value(value) {
    this.foundation.nativeControl.domNode.value = value;
  }
}
