/**
 * This is pretty darn close to the foundation
 * That is present in mdc right now
 *
 * The main differences are
 * - All calls to the adapter were replaced with setting the state of individual elements
 * - Shoved the constants in here out of laziness
 * - added both attachToDom and setState as new functions
 */

import { Foundation } from './base-foundation';

const ROOT = 'mdc-checkbox';

/** @enum {string} */
const cssClasses = {
  UPGRADED: 'mdc-checkbox--upgraded',
  CHECKED: 'mdc-checkbox--checked',
  INDETERMINATE: 'mdc-checkbox--indeterminate',
  DISABLED: 'mdc-checkbox--disabled',
  ANIM_UNCHECKED_CHECKED: 'mdc-checkbox--anim-unchecked-checked',
  ANIM_UNCHECKED_INDETERMINATE: 'mdc-checkbox--anim-unchecked-indeterminate',
  ANIM_CHECKED_UNCHECKED: 'mdc-checkbox--anim-checked-unchecked',
  ANIM_CHECKED_INDETERMINATE: 'mdc-checkbox--anim-checked-indeterminate',
  ANIM_INDETERMINATE_CHECKED: 'mdc-checkbox--anim-indeterminate-checked',
  ANIM_INDETERMINATE_UNCHECKED: 'mdc-checkbox--anim-indeterminate-unchecked'
};

/** @enum {string} */
const strings = {
  NATIVE_CONTROL_SELECTOR: `.${ROOT}__native-control`,
  TRANSITION_STATE_INIT: 'init',
  TRANSITION_STATE_CHECKED: 'checked',
  TRANSITION_STATE_UNCHECKED: 'unchecked',
  TRANSITION_STATE_INDETERMINATE: 'indeterminate',
  ARIA_CHECKED_ATTR: 'aria-checked',
  ARIA_CHECKED_INDETERMINATE_VALUE: 'mixed'
};

/** @enum {number} */
const numbers = {
  ANIM_END_LATCH_MS: 250
};

const CB_PROTO_PROPS = ['checked', 'indeterminate'];

export class CheckboxFoundation extends Foundation {
  // Create all the elements
  root = this.createEl({
    classes: ['mdc-checkbox']
  });
  nativeControl = this.createEl({
    classes: ['mdc-checkbox__native-control']
  });
  background = this.createEl({
    classes: ['mdc-checkbox__background']
  });
  checkmark = this.createEl({
    classes: ['mdc-checkbox__checkmark']
  });
  checkmarkPath = this.createEl({
    classes: ['mdc-checkbox__checkmark-path']
  });
  mixedMark = this.createEl({
    classes: ['mdc-checkbox__mixedmark']
  });

  static get cssClasses() {
    return cssClasses;
  }

  /** @return enum {strings} */
  static get strings() {
    return strings;
  }

  /** @return enum {numbers} */
  static get numbers() {
    return numbers;
  }

  constructor() {
    super();

    /** @private {string} */
    this.currentCheckState_ = strings.TRANSITION_STATE_INIT;

    /** @private {string} */
    this.currentAnimationClass_ = '';

    /** @private {number} */
    this.animEndLatchTimer_ = 0;

    /** @private {boolean} */
    this.enableAnimationEndHandler_ = false;
  }

  /** @override */
  init() {
    this.currentCheckState_ = this.determineCheckState_();
    this.updateAriaChecked_();
    this.root.addClass(cssClasses.UPGRADED);
    this.installPropertyChangeHooks_();
  }

  /**
   * Once we are present in the DOM / rendered, do some setup
   */
  attachToDom(domNode) {
    this.root.setDomNode(domNode);
    this.nativeControl.setDomNode(
      domNode.querySelector('.mdc-checkbox__native-control')
    );

    this.handleChange_ = () => this.handleChange();
    this.handleAnimationEnd_ = () => this.handleAnimationEnd();

    this.nativeControl.addEvent('change', this.handleChange_);
    this.root.addEvent('animationend', this.handleAnimationEnd_);
  }

  /**
   * A way to set the state of the component
   * Without firing the onChange hooks
   */
  setState(state = {}) {
    this.onChangeEnabled = false;
    Object.entries(state).forEach(([key, val]) => {
      if (val === undefined) return;
      switch (key) {
        case 'checked':
          this.nativeControl.setAttr(key, val);
          break;
        case 'indeterminate':
          this.nativeControl.domNode.indeterminate = val;
          break;
        case 'disabled':
          this.setDisabled(val);
          break;
        default:
          break;
      }
    });
    this.onChangeEnabled = true;
  }

  /** @override */
  destroy() {
    this.uninstallPropertyChangeHooks_();
    clearTimeout(this.animEndLatchTimer_);
  }

  /** @param {boolean} disabled */
  setDisabled(disabled) {
    this.nativeControl.setAttr('disabled', true);
    if (disabled) {
      this.root.addClass(cssClasses.DISABLED);
    } else {
      this.root.removeClass(cssClasses.DISABLED);
    }
  }

  /**
   * Handles the animationend event for the checkbox
   */
  handleAnimationEnd() {
    if (!this.enableAnimationEndHandler_) return;

    clearTimeout(this.animEndLatchTimer_);

    this.animEndLatchTimer_ = setTimeout(() => {
      this.root.removeClass(this.currentAnimationClass_);
      this.enableAnimationEndHandler_ = false;
    }, numbers.ANIM_END_LATCH_MS);
  }

  /**
   * Handles the change event for the checkbox
   */
  handleChange() {
    this.transitionCheckState_();
  }

  /** @private */
  installPropertyChangeHooks_() {
    const nativeCb = this.nativeControl.domNode;
    const cbProto = Object.getPrototypeOf(nativeCb);

    CB_PROTO_PROPS.forEach(controlState => {
      const desc = Object.getOwnPropertyDescriptor(cbProto, controlState);
      // We have to check for this descriptor, since some browsers (Safari) don't support its return.
      // See: https://bugs.webkit.org/show_bug.cgi?id=49739
      if (validDescriptor(desc)) {
        const nativeCbDesc = /** @type {!ObjectPropertyDescriptor} */ ({
          get: desc.get,
          set: state => {
            desc.set.call(nativeCb, state);
            this.transitionCheckState_();
          },
          configurable: desc.configurable,
          enumerable: desc.enumerable
        });
        Object.defineProperty(nativeCb, controlState, nativeCbDesc);
      }
    });
  }

  /** @private */
  uninstallPropertyChangeHooks_() {
    const nativeCb = this.getNativeControl_();
    const cbProto = Object.getPrototypeOf(nativeCb);

    CB_PROTO_PROPS.forEach(controlState => {
      const desc = /** @type {!ObjectPropertyDescriptor} */ (Object.getOwnPropertyDescriptor(
        cbProto,
        controlState
      ));
      if (validDescriptor(desc)) {
        Object.defineProperty(nativeCb, controlState, desc);
      }
    });
  }

  /** @private */
  transitionCheckState_() {
    if (!this.nativeControl.domNode) {
      return;
    }
    const oldState = this.currentCheckState_;
    const newState = this.determineCheckState_();

    if (oldState === newState) {
      return;
    }

    this.updateAriaChecked_();

    // Check to ensure that there isn't a previously existing animation class, in case for example
    // the user interacted with the checkbox before the animation was finished.
    if (this.currentAnimationClass_.length > 0) {
      clearTimeout(this.animEndLatchTimer_);
      (() => this.root.domNode.offsetWidth)();
      this.root.removeClass(this.currentAnimationClass_);
    }

    this.currentAnimationClass_ = this.getTransitionAnimationClass_(
      oldState,
      newState
    );
    this.currentCheckState_ = newState;

    // Check for parentNode so that animations are only run when the element is attached
    // to the DOM.
    if (
      Boolean(this.root.domNode.parentNode) &&
      this.currentAnimationClass_.length > 0
    ) {
      this.root.addClass(this.currentAnimationClass_);
      this.enableAnimationEndHandler_ = true;
    }
  }

  /**
   * @return {string}
   * @private
   */
  determineCheckState_() {
    const {
      TRANSITION_STATE_INDETERMINATE,
      TRANSITION_STATE_CHECKED,
      TRANSITION_STATE_UNCHECKED
    } = strings;

    if (this.nativeControl.domNode.indeterminate) {
      return TRANSITION_STATE_INDETERMINATE;
    }
    return this.nativeControl.domNode.checked
      ? TRANSITION_STATE_CHECKED
      : TRANSITION_STATE_UNCHECKED;
  }

  /**
   * @param {string} oldState
   * @param {string} newState
   * @return {string}
   */
  getTransitionAnimationClass_(oldState, newState) {
    const {
      TRANSITION_STATE_INIT,
      TRANSITION_STATE_CHECKED,
      TRANSITION_STATE_UNCHECKED
    } = strings;

    const {
      ANIM_UNCHECKED_CHECKED,
      ANIM_UNCHECKED_INDETERMINATE,
      ANIM_CHECKED_UNCHECKED,
      ANIM_CHECKED_INDETERMINATE,
      ANIM_INDETERMINATE_CHECKED,
      ANIM_INDETERMINATE_UNCHECKED
    } = CheckboxFoundation.cssClasses;

    switch (oldState) {
      case TRANSITION_STATE_INIT:
        if (newState === TRANSITION_STATE_UNCHECKED) {
          return '';
        }
      // fallthrough
      case TRANSITION_STATE_UNCHECKED:
        return newState === TRANSITION_STATE_CHECKED
          ? ANIM_UNCHECKED_CHECKED
          : ANIM_UNCHECKED_INDETERMINATE;
      case TRANSITION_STATE_CHECKED:
        return newState === TRANSITION_STATE_UNCHECKED
          ? ANIM_CHECKED_UNCHECKED
          : ANIM_CHECKED_INDETERMINATE;
      // TRANSITION_STATE_INDETERMINATE
      default:
        return newState === TRANSITION_STATE_CHECKED
          ? ANIM_INDETERMINATE_CHECKED
          : ANIM_INDETERMINATE_UNCHECKED;
    }
  }

  updateAriaChecked_() {
    // Ensure aria-checked is set to mixed if checkbox is in indeterminate state.
    if (this.nativeControl.domNode.indeterminate) {
      this.nativeControl.setAttr(
        strings.ARIA_CHECKED_ATTR,
        strings.ARIA_CHECKED_INDETERMINATE_VALUE
      );
    } else {
      // The on/off state does not need to keep track of aria-checked, since
      // the screenreader uses the checked property on the checkbox element.
      this.nativeControl.removeAttr(strings.ARIA_CHECKED_ATTR);
    }
  }

  /**
   * @return {!MDCSelectionControlState}
   * @private
   */
  getNativeControl_() {
    return (
      this.nativeControl.domNode || {
        checked: false,
        indeterminate: false,
        disabled: false,
        value: null
      }
    );
  }
}

/**
 * @param {ObjectPropertyDescriptor|undefined} inputPropDesc
 * @return {boolean}
 */
function validDescriptor(inputPropDesc) {
  return !!inputPropDesc && typeof inputPropDesc.set === 'function';
}
