/**
 * This is the majority of the "magic" required for the vanilla
 * JS components. This is the onChange function executed by "Element"
 * Basically, we just listen for what changed and respond accordingly
 * This is easily extensible with additional behaviors
 */

export class Component {
  onChange(element, changeType, ...args) {
    const domNode = element.domNode;
    switch (changeType) {
      case 'addClass':
        domNode.classList.add(args[0]);
        break;
      case 'removeClass':
        domNode.classList.remove(args[0]);
        break;
      case 'setAttr':
        domNode.setAttribute(args[0], args[1]);
        break;
      case 'removeAttr':
        domNode.removeAttribute(args[0]);
        break;
      case 'addEvent':
        domNode.addEventListener(args[0], args[1]);
        break;
      case 'removeEvent':
        domNode.removeEventListener(args[0], args[1]);
        break;
      default:
        break;
    }
  }
}
