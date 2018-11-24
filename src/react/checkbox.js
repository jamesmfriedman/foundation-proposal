/**
 * This is an example of implementing the checkbox in React
 * This was quickly hacked together, but I hope you get the idea
 * It requires very little code to hook up, and React is responsible
 * For handling connecting the events, attributes, and classes
 *
 * This could be simplified even more by having a base class to extend
 * This hasn't been optimized in the slightest, you would just want
 * to reduce this.foundation.onChange from being called when it doesn't need to be
 */

import * as React from 'react';
import classNames from 'classnames';
import { CheckboxFoundation } from '../foundation/checkbox-foundation';

export class Checkbox extends React.Component {
  foundation = new CheckboxFoundation();
  root = null;

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.foundation.onChange = () => this.render();
    this.foundation.attachToDom(this.root);
    this.foundation.init();
  }

  handleChange(evt) {
    this.props.onChange && this.props.onChange(evt);
    this.foundation.nativeControl.events.change(evt);
  }

  render() {
    const { checked, disabled, indeterminate, onChange } = this.props;
    this.foundation.setState({ checked, disabled, indeterminate });

    return (
      <div className="mdc-form-field">
        <div
          id="my-react-checkbox"
          onAnimationEnd={this.foundation.root.events.animationend}
          className={classNames(...this.foundation.root.classes)}
          ref={el => (this.root = el)}
        >
          <input
            checked={checked}
            type="checkbox"
            onChange={this.handleChange}
            className={classNames(...this.foundation.nativeControl.classes)}
            id="react-checkbox"
          />
          <div className={classNames(...this.foundation.background.classes)}>
            <svg
              className={classNames(...this.foundation.checkmark.classes)}
              viewBox="0 0 24 24"
            >
              <path
                className={classNames(...this.foundation.checkmarkPath.classes)}
                fill="none"
                d="M1.73,12.91 8.1,19.28 22.79,4.59"
              />
            </svg>
            <div className={classNames(...this.foundation.mixedMark.classes)} />
          </div>
        </div>
        <label htmlFor="react-checkbox">React Checkbox</label>
      </div>
    );
  }
}
