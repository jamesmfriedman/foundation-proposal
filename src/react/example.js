import React from 'react';
import ReactDOM from 'react-dom';

import { Checkbox } from './checkbox';

class Example extends React.Component {
  state = {
    checked: false
  };

  render() {
    return (
      <Checkbox
        checked={this.state.checked}
        onChange={evt => this.setState({ checked: evt.target.checked })}
      />
    );
  }
}

ReactDOM.render(<Example />, document.getElementById('react-root'));
