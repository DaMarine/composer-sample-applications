import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import './matiaspage.css';
import axios from 'axios';
import Table from '../../Table/Table.js';


class MatiasPage extends Component {
  constructor(props) {
		super(props);
		this.state = {
			userDetails: {},
      letters: [],
      gettingLetters: false,
      switchUser: this.props.switchUser,
      callback: this.props.callback,
      redirect: false,
      redirectTo: '',
      isLetterOpen: false
		}
    this.handleOnClick = this.handleOnClick.bind(this);
    this.openLetter = this.openLetter.bind(this);
	}

  handleOnClick(user) {
    this.state.switchUser(user);
    this.setState({redirect: true, redirectTo: user});
  }

  openLetter(i) {
    this.props.callback(this.state.letters[i], false);
    this.setState({isLetterOpen: true, redirectTo: 'matias'});
  }

	componentDidMount() {
    // open a websocket
    this.connection = new WebSocket('ws://localhost:3000');
    this.connection.onmessage = ((evt) => {
      this.getLetters();
    });

    // make rest calls
    let cURL = 'http://localhost:3000/api/BankEmployee/matias';
		axios.get(cURL)
		.then(response => {
			this.setState ({
				userDetails: response.data
      });
    })
    .catch(error => {
      console.log(error);
    });
    this.getLetters();
  }

  componentWillUnmount() {
    this.connection.close();
  }

  getLetters() {
		this.setState({gettingLetters: true});
		axios.get('http://localhost:3000/api/LetterOfCredit')
    .then(response => {
      // sort the LOCs by descending ID (will display the most recent first)
			response.data.sort((a,b) => b.letterId.localeCompare(a.letterId));
      this.setState ({
        letters: response.data,
        gettingLetters: false
			});
		})
		.catch(error => {
			console.log(error);
		});
	}

  generateStatus(letter){
    let status = '';
    if (letter.status === 'AWAITING_APPROVAL') {
      if (!letter.approval.includes('matias')) {
        status = 'Awaiting approval from YOU';
      } else if (!letter.approval.includes('ella')) {
        status = 'Awaiting approval from Confirming Bank';
      } else if (letter.approval.includes('ella') && !letter.approval.includes('bob')) {
        status = 'Awaiting approval from Beneficiary';
      }
    } else { 
      status = letter.status.toLowerCase();
      status = status.charAt(0).toUpperCase() + status.slice(1);
    }
    return status;
  }
  
  generateRow(i) {
    let submitter = "Alice Hamilton";
    let company = "QuickFix IT";
    if(this.state.letters[i].applicant === 'resource:org.acme.loc.Customer#bob') {
      submitter = "Bob Bobbins";
      company = "Conga Computers"
    }
    let status = this.generateStatus(this.state.letters[i])
    return (
			<tr className="row" onClick={() => this.openLetter(i) }>
				<td className="blueText">{this.state.letters[i].letterId}</td>
				<td>{submitter}</td>
				<td>{company}</td>
				<td>{status}</td>
			</tr>
		);
  }

  render() {
    if(this.state.isLetterOpen) {
      return <Redirect push to={this.state.redirectTo + "/loc"} />;
    }
    else if (this.state.redirect) {
      return <Redirect push to={"/" + this.state.redirectTo} />;
    }

    if(this.state.userDetails.name && !this.state.gettingLetters) {
      let username = this.state.userDetails.name + ", Employee at " + this.state.userDetails.bankName;

      let rowsJSX = [];
      if(this.state.letters.length) {
        for(let i = 0; i < this.state.letters.length; i++) {
          rowsJSX.push(this.generateRow(i))
        }
      }

      return (
        <div id="matiasPageContainer" className="matiasPageContainer">
          <div id="matiasHeaderDiv" className="flexDiv matiasHeaderDiv">
            <span className="matiasUsername"> {username} </span>
            <div id="matiasMenu" className="matiasMenuItems">
              <span> Change account details </span>
              <span> View Transaction History </span>
              <span> Make Transaction </span>
              <span> Viewing all Business Acccounts </span>
            </div>
          </div>
          <div id="matiasWelcomeDiv" className="matiasWelcomeDiv">
            <h1> Welcome back {this.state.userDetails.name} </h1>
          </div>
          <div id="tableDiv">
            <Table rows={rowsJSX}/>
          </div>
        </div>
      );
    } else {
      return(
        <div id="matiasLoadingContainer" className="matiasPageContainer">
				  <span className="matiasLoadingSpan">Loading...</span>
        </div>
      );
    }
  }
}

export default MatiasPage;
