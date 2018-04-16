import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import './letterofcredit.css';
import DetailsCard from '../DetailsCard/DetailsCard.js';
import BlockChainDisplay from '../BlockChainDisplay/BlockChainDisplay.js';
import axios from 'axios';
import { connect } from "react-redux";

import backButtonIcon from '../../resources/images/left-arrow.svg'

class LetterOfCredit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.match.params.name,
      transactions: [],
      disableButtons: false,
      redirect: false,
      redirectTo: ''
		}
    this.handleOnClick = this.handleOnClick.bind(this);
	}

  handleOnClick(user) {
    this.props.callback(user);
    this.setState({redirect: true, redirectTo: user});
  }

  componentWillMount() {
    axios.get('http://localhost:3000/api/system/historian')
    .then((response) => {
      let relevantTransactions = [];
      let transactionTypes = ["InitialApplication", "Approve", "Reject", "ShipProduct", "ReceiveProduct", "Close"];
      response.data.map((i) => {
        let transactionLetter = ((i.eventsEmitted.length) ? i.eventsEmitted[0].loc.split("#")[1] : undefined);
        let longName = i.transactionType.split(".")
        let name = longName[longName.length - 1];
        if(transactionTypes.includes(name) && this.props.letter.letterId === transactionLetter) {
          relevantTransactions.push(i);
        }
      });
      relevantTransactions.sort((a,b) => a.transactionTimestamp.localeCompare(b.transactionTimestamp));
      this.setState ({
        transactions: relevantTransactions
      });
    })
    .catch(error => {
      console.log(error);
    });
  }

  createRules() {
    let rules = [];
    let ruleIndex = 1;
    this.props.rules.map((i) => {
      if (i.ruleText !== "") {
        rules.push({
          "$class": "org.acme.loc.Rule",
          "ruleId": "rule"+ruleIndex,
          "ruleText": i.ruleText
        });
      ruleIndex++;
      }
    });
    return rules;
  }

  createLOC(type, quantity, price, rules) {
    this.setState({
      disableButtons: true
    });
    let currentTime = new Date().toLocaleTimeString().split(":").join('');
    axios.post('http://localhost:3000/api/InitialApplication', {
      "$class": "org.acme.loc.InitialApplication",
      "letterId": ("L" + currentTime),
      "applicant": "resource:org.acme.loc.Customer#alice",
      "beneficiary": "resource:org.acme.loc.Customer#bob",
      "rules": this.createRules(),
      "productDetails": {
        "$class": "org.acme.loc.ProductDetails",
        "productType": type,
        "quantity": quantity,
        "pricePerUnit": price.toFixed(2),
        "id": "string"
      },
      "transactionId": "",
      "timestamp": "2018-03-13T11:35:00.218Z" // the transactions seem to need this field in; when submitted the correct time will replace this value
    })
    .then(() => {
      let letter = "resource:org.acme.loc.LetterOfCredit#" + ("L" + currentTime);
      return axios.post('http://localhost:3000/api/Approve', {
        "$class": "org.acme.loc.Approve",
        "loc": letter,
        "approvingParty": this.state.user,
        "transactionId": "",
        "timestamp": "2018-03-13T11:25:08.043Z" // the transactions seem to need this field in; when submitted the correct time will replace this value
      });
    })
    .then(() => {
      this.setState({
        disableButtons: false
      })
      this.handleOnClick(this.state.user);
    })
    .catch(error => {
      console.log(error);
    });
  }

  approveLOC(letterId, approvingParty) {
    if(!this.props.letter.approval.includes(this.state.user)) {
      this.setState({
        disableButtons: true
      });
      let letter = "resource:org.acme.loc.LetterOfCredit#" + letterId
      axios.post('http://localhost:3000/api/Approve', {
        "$class": "org.acme.loc.Approve",
        "loc": letter,
        "approvingParty": approvingParty,
        "transactionId": "",
        "timestamp": "2018-03-13T11:25:08.043Z" // the transactions seem to need this field in; when submitted the correct time will replace this value
      })
      .then(() => {
        this.setState({
          disableButtons: false
        });
        this.handleOnClick(this.state.user);
      })
      .catch(error => {
        console.log(error);
      });
    }
  }

  rejectLOC(letterId) {
    this.setState({
      disableButtons: true
    });
    let letter = "resource:org.acme.loc.LetterOfCredit#" + letterId
    axios.post('http://localhost:3000/api/Reject', {
      "$class": "org.acme.loc.Reject",
      "loc": letter,
      "closeReason": "Letter has been rejected",
      "transactionId": "",
      "timestamp": "2018-03-13T11:35:00.281Z" // the transactions seem to need this field in; when submitted the correct time will replace this value
    })
    .then(() => {
      this.setState({
        disableButtons: false
      });
      this.handleOnClick(this.state.user);
    })
    .catch(error => {
      console.log(error);
    });
  }

  closeLOC(letterId) {
    this.setState({
      disableButtons: true
    });
    let letter = "resource:org.acme.loc.LetterOfCredit#" + letterId
    axios.post('http://localhost:3000/api/Close', {
      "$class": "org.acme.loc.Close",
      "loc": letter,
      "closeReason": "Letter has been completed.",
      "transactionId": "",
      "timestamp": "2018-03-13T11:35:00.139Z" // the transactions seem to need this field in; when submitted the correct time will replace this value
    })
    .then(() => {
      this.setState({
        disableButtons: false
      });
      this.handleOnClick(this.state.user);
    })
    .catch(error => {
      console.log(error);
    })
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={"/" + this.state.redirectTo} />;
    }

    let productDetails = this.props.productDetails;
    let rules = this.props.rules;
    let buttonJSX = (<div/>);
    if (!this.props.isApply) {
      productDetails = {
        type: this.props.letter.productDetails.productType,
        quantity: this.props.letter.productDetails.quantity,
        pricePerUnit: this.props.letter.productDetails.pricePerUnit
      };
      rules = this.props.letter.rules;
      if (this.props.letter.status === 'AWAITING_APPROVAL' && !this.props.letter.approval.includes(this.state.user)) {
        buttonJSX = (
          <div class="actions">
            <button disabled={this.state.disableButtons} onClick={() => {this.approveLOC(this.props.letter.letterId, this.state.user)}}>I accept the application</button>
            <button disabled={this.state.disableButtons} onClick={() => {this.rejectLOC(this.props.letter.letterId)}}>I reject the application</button>
            { this.state.disableButtons && <span class="statusMessage"> Please wait... </span> }
          </div>
          );
      } else if (this.props.letter.status === 'RECEIVED' && this.props.user === 'ella') {
        buttonJSX = (
          <div class="actions">
            <button disabled={this.state.disableButtons} onClick={() => this.closeLOC(this.props.letter.letterId)}>Close this Letter of Credit</button>
            { this.state.disableButtons && <span class="statusMessage"> Please wait... </span> }
          </div>
        )
      } else {
        buttonJSX = (<div/>);
      }
    } else {
      buttonJSX = (
        <div class="actions">
          <button disabled={this.state.disableButtons} onClick={() => this.createLOC(this.props.productDetails.type, this.props.productDetails.quantity, this.props.productDetails.pricePerUnit, this.props.rules)}>Start approval process</button>
          { this.state.disableButtons && <span class="statusMessage"> Please wait... </span> }
        </div>
      );
    }

    return (
      <div class="LCcontainer">
        <img class="backButton" src={backButtonIcon} alt="go back" onClick={() => {if(!this.state.disableButtons){this.handleOnClick(this.state.user)}}}/>
        <div class="header">
          <div class="letterDetails">
            <h2>{this.props.letter.letterId}</h2>
            <h2>User logged in: {this.state.user.charAt(0).toUpperCase() + this.state.user.slice(1)}</h2>
          </div>
        </div>
        <div class="letterContent">
          <DetailsCard type="Person" data={["Application Request"].concat(Object.values(this.props.applicant))}/>
          <DetailsCard type="Person" data={["Supplier Request"].concat(Object.values(this.props.beneficiary))}/>
          <DetailsCard type="Product" data={["Product Details"].concat(Object.values(productDetails))} canEdit={this.props.isApply}/>
        </div>
        <br/>
        <div class="rules">
          <DetailsCard type="Rules" data={rules} canEdit={this.props.isApply}/>
        </div>
        {buttonJSX}
        <div class="blockChainContainer">
          <BlockChainDisplay transactions={this.state.transactions}/>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { 
    applicant: state.getLetterInputReducer.applicant,
    beneficiary: state.getLetterInputReducer.beneficiary,
    productDetails: state.getLetterInputReducer.productDetails, 
    rules: state.getLetterInputReducer.rules 
  };
};

export default connect(mapStateToProps)(LetterOfCredit);
