import React, { Component } from 'react';
import Navbar from 'react-bootstrap/lib/Navbar';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Grid from 'react-bootstrap/lib/Grid';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';

import Cookies from 'js-cookie';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import LoginForm from './Component/LoginForm';
import MainPanel from './Component/MainPanel';

import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import swal from 'sweetalert';

import Api from './Logic/Api';

class MainPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      login: false
    }

    this.onLogin = this.onLogin.bind(this);
  }

  componentDidMount() {
    var token = Cookies.get('token');
    if (token) {
      Api.auth(token)
      .then(response =>
        {
          if (response.ok) {
            this.setState({
              login: true,
            });
          }
        })
    }
  }

  onLogin(data) {
    Cookies.set('token', data.token, { expires: 7 });
    this.setState({
      login: true,
    });
  }

  render() {
    var content;
    if (this.state.login) {
      return <MainPanel title="主页面"/>;
    } else {
      return <LoginForm onLogin={this.onLogin}/>
    }
  }
}

class SharePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null
    }
  }
  
  componentDidMount() {
    const path = this.props.match.params.path
    Api.getFileInfoWithShareUrl(path)
    .then(response => {
      if (response.ok) {
        response.json()
        .then(responseJson => {
          this.setState({
            file: responseJson.data
          })

          var token = Cookies.get('token');
          if (token) {
            return;
          } else if (responseJson.data.open_private_share) {
            swal({
              text: 'Please type the password',
              content: {
                element: "input",
                attributes: {
                  placeholder: "Type your password",
                  type: "password",
                },
              },
              button: {
                text: "Go",
                closeModal: false,
                closeOnEsc: false,
              },
              closeOnClickOutside: false,
            })
            .then(password => {
              Api.getFileInfoWithShareUrl(path, password)
              .then(response => {
                response.json()
                .then(responseJson => {
                  if (responseJson.data.token) {
                    Cookies.set('token', responseJson.data.token, { expires: 1 });
                    swal.close();
                  } else {
                    swal("Wrong password");
                  }
                });
              })
            })
          }
          
          if (responseJson.data.token) {
            Cookies.set('token', responseJson.data.token, { expires: 1 });
          }
        })
      }
    })
  }

  render() {
    if (!this.state.file) {
      return (
        <Col md={4} mdOffset={4}>
          <span> The file you are requesting does not exists! </span>
        </Col>
      );
    }
    return (
      <Row>
        <Col md={1} mdOffset={4}>
          <Glyphicon glyph='file' style={{ 'fontSize': '90px'}}/>
        </Col>
        <Col md={4}>
        <p>{this.state.file.filename}</p>
        <Button style={{ 'marginTop': '25px' }} href={Api.generateShareFileDownloadUrl(this.props.match.params.path)}><Glyphicon glyph='save-file' />Download</Button>
        </Col>
      </Row>
    );
  }
}

const App = () => (
  <Router>
    <Grid>
      <Row>
          <Navbar>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="/">CloudDisk</a>
              </Navbar.Brand>
            </Navbar.Header>
          </Navbar>
          <Route path="/" exact component={MainPage} />
          <Route path="/s/:path" component={SharePage} />
      </Row>
    </Grid>
  </Router>
);


export default App;
