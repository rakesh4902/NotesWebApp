import { Component } from 'react';
import { Link } from 'react-router-dom';
import { TiTick } from "react-icons/ti";
import './index.css'; 

class SignupPage extends Component {
  state = {
    password: '',
    username: '',
    errorMessage: '',
    showErrorMessage: false,
    showSuccessMessage: false,
  };

  submitSuccess = () => {
    this.setState({ showSuccessMessage: true, showErrorMessage: false });
  };

  submitFailure = (errorMsg) => {
    this.setState({ errorMessage: errorMsg, showErrorMessage: true, showSuccessMessage: false });
  };

  onSubmitSignupDetails = async (event) => {
    event.preventDefault();
    const { password, username } = this.state;
    const userDetails = { username, password };
    const url = 'https://noteswebapp-1.onrender.com/register/ ';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDetails),
      });

      const data = await response.json();
      if (response.ok) {
        this.submitSuccess();
      } else {
        this.submitFailure(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      this.submitFailure('Network error');
    }
  };

  onChangeInputValue = (event) => {
    this.setState({ [event.target.name]: event.target.value, showErrorMessage: false });
  };

  render() {
    const { errorMessage, showErrorMessage, showSuccessMessage } = this.state;
    return (
      <div className="login-border-container">
        {showSuccessMessage ? (
          <div className='login-container'>
           <div className="submission-tick" >
                <TiTick size={60}/>
            </div>
            <p className="success_msg">You have signed up successfully!</p>
            <Link to="/login"><button type="button" className="login-back-button">
              Click here to Login
            </button>
            </Link>
          </div>
        ) : (
          <form className="login-container" onSubmit={this.onSubmitSignupDetails}>
            <h1 className="login-head">Signup</h1>

            <div className="user-details-container">
              <label className="name" htmlFor="username">
                USERNAME
              </label>
              <input
                id="username"
                type="text"
                name="username"
                className="input-name"
                required
                placeholder="Enter Username"
                onChange={this.onChangeInputValue}
              />
            </div>
            <div className="user-details-container">
              <label className="name" htmlFor="password">
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                name="password"
                className="input-name"
                placeholder="Enter Valid Password"
                required
                onChange={this.onChangeInputValue}
              />
            </div>
            {showErrorMessage && <p className="error_msg">{errorMessage}</p>}
            {!showSuccessMessage && (
              <div className="buttons">
              <button type="submit" className="login-button">
                Signup
              </button>
              <Link to="/login"><button type="button" className="login-button">
                Login
            </button>
            </Link>
            </div>
            )}
          </form>
        )}
      </div>
    );
  }
}

export default SignupPage;