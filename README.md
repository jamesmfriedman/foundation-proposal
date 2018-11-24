# Foundation Proposal

This quick and dirty prototype was thrown together to prove that material-components-web could be greatly simplified by turning the foundations interface into a state machine in lieu of trying to instrument individual behaviors through the current adapter pattern.

In exploring this proof of concept I've observed
- A massive reduction in complexity
- A markedly simpler time implementing both the React and Vanilla JS version
- Vue, Angular, AngularJS, and Preact all have a component driven architecture that can be used with a uni-directional data flow which means this pattern is NOT React specific.

To view, run `npm i && npm start`

