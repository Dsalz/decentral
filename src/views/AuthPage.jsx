/* eslint-disable no-underscore-dangle */
import React, { Component, Fragment } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import Portis from "@portis/web3";
import dotenv from "dotenv";

// Components
import Loader from "../components/Loader";

// CSS
import "../css/AuthPage.css";

dotenv.config();

/**
 * @class AuthPage
 */
class AuthPage extends Component {
  state = {
    isAuthenticated: false,
    user: {},
    loading: false,
    error: ""
  };

  /**
   * @method connectAccount
   * @description Method to launch web3 modal to connect account
   * @returns {undefined}
   */
  connectAccount = async () => {
    try {
      const providerOptions = {
        portis: {
          package: Portis,
          options: {
            id: process.env.PORTIS_KEY
          }
        }
      };
      const web3Modal = new Web3Modal({
        network: "kovan",
        providerOptions
      });

      this.setState({
        loading: true
      });

      web3Modal.on("close", () => {
        this.setState({
          loading: false
        });
      });

      const provider = await web3Modal.connect();

      const web = new Web3(provider);

      const { isPortis } = provider;

      const address = isPortis
        ? provider._portis._selectedAddress
        : provider.selectedAddress;

      const weiBalance = await web.eth.getBalance(address);
      const balance = web.utils.fromWei(weiBalance);
      this.setState({
        isAuthenticated: true,
        user: {
          address,
          balance
        },
        loading: false
      });
    } catch (e) {
      return this.setState({
        error: "Could not connect to account",
        loading: false
      });
    }
  };

  /**
   * @method render
   * @returns {JSX} auth page
   */
  render() {
    const { isAuthenticated, user, loading, error } = this.state;
    return (
      <Fragment>
        {loading && <Loader />}
        {!loading && (
          <div className="auth-page-section centralised-items-div w-100 h-100">
            {!isAuthenticated && (
              <div className="no-auth-div">
                <button
                  type="button"
                  className="connect-btn blue-bg blue-shadow"
                  onClick={this.connectAccount}
                >
                  Connect
                </button>
                {error && <div className="error-text">{error}</div>}
              </div>
            )}
            {isAuthenticated && (
              <div className="auth-info-section blue-bg blue-shadow">
                <p>
                  Address: <span>{user.address}</span>
                </p>
                <p>
                  Balance: <span>{user.balance} ETH</span>
                </p>
              </div>
            )}
          </div>
        )}
      </Fragment>
    );
  }
}

export default AuthPage;
