import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import './App.css';
import LetterOfCredit from './components/LetterOfCredit/LetterOfCredit.js';
import AlicePage from './components/Pages/AlicePage/AlicePage.js';
import BobPage from './components/Pages/BobPage/BobPage.js';
import MatiasPage from './components/Pages/MatiasPage/MatiasPage.js';
import EllaPage from './components/Pages/EllaPage/EllaPage.js';

const pageContents = {
  ALICE: "ALICE",
  BOB: "BOB",
  MATIAS: "MATIAS",
  ELLA: "ELLA",
  LOC: "LOC"
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentPage: pageContents.ALICE,
      currentLetter: {},
      currentUser: "alice"
    };
    this.changeUser = this.changeUser.bind(this);
    this.goToLetterScreen = this.goToLetterScreen.bind(this);
  }

  goToLetterScreen(letter, isApply) {
    this.setState({
      currentPage: pageContents.LOC,
      currentLetter: letter,
      isApply: isApply
    });
  }

  changeUser(user) {
    if(user === 'alice') {
      this.setState({
        currentPage: pageContents.ALICE,
        currentUser: "alice"
      });
    } else if (user === 'bob') {
      this.setState({
        currentPage: pageContents.BOB,
        currentUser: "bob"
      });
    } else if (user === 'matias') {
      this.setState({
        currentPage: pageContents.MATIAS,
        currentUser: "matias"
      });
    } else {
      this.setState({
        currentPage: pageContents.ELLA,
        currentUser: "ella"
      });
    }
  }

  render() {
    return (
      <Switch>
        <Route exact path="/alice" render={(props) => <AlicePage user={this.state.currentUser} switchUser={this.changeUser} callback={this.goToLetterScreen} {...props}/>}/>
        <Route exact path="/matias" render={(props) => <MatiasPage user={this.state.currentUser} switchUser={this.changeUser} callback={this.goToLetterScreen} {...props}/>}/>
        <Route exact path="/bob" render={(props) => <BobPage user={this.state.currentUser} switchUser={this.changeUser} callback={this.goToLetterScreen} {...props}/>}/>
        <Route exact path="/ella" render={(props) => <EllaPage user={this.state.currentUser} switchUser={this.changeUser} callback={this.goToLetterScreen} {...props}/>}/>
        <Route path="/:name/loc" render={(props) => <LetterOfCredit letter={this.state.currentLetter} callback={this.changeUser} isApply={this.state.isApply} user={this.state.currentUser} {...props}/>}/>
        <Redirect to="/alice" />
      </Switch>
    );
  }
}

export default App;
