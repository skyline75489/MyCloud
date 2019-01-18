import React, { useState } from 'react';
import Col from 'react-bootstrap/lib/Col';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Alert from 'react-bootstrap/lib/Alert';

import './LoginForm.css';

import Api from '../Logic/Api';

const LoginForm = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(false);

    const login = () => {
        Api.login(email, password)
        .then(response => {
            if (!response.ok) {
                setLoginError(true);
                return;
            }

            response.json()
            .then(data => props.onLogin(data))
        });
    }

    var alert;
    if (loginError) {
        alert = (
            <Alert bsStyle='danger'>
            <strong>Error: </strong>Wrong email or password.
            </Alert>
        );
        } else {
        alert = <span></span>;
    }

    return (
        <Col md={4} mdOffset={4}>
            <h3>Login</h3>
            {alert}
            <form id="loginForm" onSubmit={(e) => { e.preventDefault(); login(); }}>
                <FormGroup>
                    <FormControl type="text" placeholder="Email" onChange={(evt) => setEmail(evt.target.value)} />
                </FormGroup>
                <FormGroup>
                    <FormControl type="password" placeholder="Password" onChange={(evt) => setPassword(evt.target.value)} />
                </FormGroup>
                <FormGroup>
                    <FormControl id="submitButton" type="submit" value="Login" /> 
                </FormGroup>
            </form>
        </Col>
    );
}

export default LoginForm;