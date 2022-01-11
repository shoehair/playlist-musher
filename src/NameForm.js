import React from "react";

class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    this.props.onValueChange(event.target.value);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Friend's username:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
      </form>
    );
  }
}

export default NameForm;