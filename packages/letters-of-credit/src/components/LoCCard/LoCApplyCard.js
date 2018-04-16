import React, {Component} from 'react';
import { Redirect } from 'react-router-dom';
import './loccard.css';

class LoCApplyCard extends Component {
  constructor(props) {
		super(props);
		this.state = {
      redirect: false
		}
    this.handleOnClick = this.handleOnClick.bind(this);
	}

  handleOnClick() {
    this.props.callback({}, true);
    this.setState({redirect: true});
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.props.user + "/loc"} />;
    }

    return (
      <div className="LoCCard noBorder">
        <h3>Letter of Credit Application</h3>
        <p>A letter of credit is issued by a bank to another bank (especially one in a different country) to serve as a guarantee for payments made to a specified person under specified conditions.</p>
        <button className="viewButton applyButton" onClick={() => this.handleOnClick()} disabled={this.props.disableApply}>Apply for a Letter of Credit</button>
      </div>
    );
  }
}


export default LoCApplyCard;
