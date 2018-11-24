/**
 * The base element that takes care of handling
 * classes, attrs, events, and the domNode for each
 * individual piece in a component
 *
 * Anytime something changes, it calls "onChange"
 */

export class Element {
  classes = new Set();
  attrs = {};
  events = {};
  domNode = null;

  constructor(opts = {}) {
    if (opts.classes) {
      this.addClass(...opts.classes);
    }
  }

  onChange() {}

  addClass(...classes) {
    classes.forEach(cls => {
      !this.classes.has(cls) && this.classes.add(cls);
    });

    this.onChange(this, 'addClass', classes);
  }

  removeClass(...classes) {
    classes.forEach(cls => {
      this.classes.has(cls) && this.classes.delete(cls);
    });
    this.onChange(this, 'removeClass', classes);
  }

  setAttr(key, value) {
    if (value === undefined) {
      this.removeAttr(key);
      return;
    }
    this.attrs[key] = value;
    this.onChange(this, 'setAttr', key, value);
  }

  removeAttr(key) {
    delete this.attrs[key];
    this.onChange(this, 'removeAttr', key);
  }

  setDomNode(domNode) {
    this.domNode = domNode;
  }

  addEvent(evtName, callback) {
    this.events[evtName] = callback;
    this.onChange(this, 'addEvent', evtName, callback);
  }

  removeEvent(evtName, callback) {
    delete this.events[evtName];
    this.onChange(this, 'removeEvent', evtName, callback);
  }
}
