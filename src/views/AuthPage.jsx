/* eslint-disable prefer-const */
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

// Utils
import axios from "../utils/customAxios";
import { getTokenAbi } from "../utils/index";

dotenv.config();

/**
 * @class AuthPage
 */
class AuthPage extends Component {
  tokenKey = "DECENTRAL_APP_TOKEN";

  state = {
    isAuthenticated: false,
    user: {},
    loading: false,
    error: "",
    transferAddress: "",
    transferAmount: "",
    transferCurrency: "ether",
    transferLoading: false,
    transferError: ""
  };

  /**
   * @method handleChange
   * @description The function that handles input change
   * @param {object} e - event object
   * @returns {undefined}
   */
  handleChange = e => {
    const { transferCurrency, user } = this.state;
    const { ethBalance, daiBalance } = user;
    let { name, value } = e.target;
    if (name === "transferAmount") {
      const max = transferCurrency === "ether" ? ethBalance : daiBalance;
      value = value > max ? max : value;
    }
    this.setState({
      [name]: value,
      receipt: null,
      transferError: ""
    });
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
        cacheProvider: true,
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

      const timeStamp = String(Date.now());
      const message = `0x${timeStamp.toString("hex")}`;

      const signature = await web.eth.personal.sign(message, address);

      const daiContract = new web.eth.Contract(
        getTokenAbi(),
        "0xc4375b7de8af5a38a93548eb8453a498222c4ff2"
      );
      const [loginResponse, weiEthBalance, weiDaiBalance] = await Promise.all([
        axios.post("/api/users/login", {
          signature,
          message
        }),
        web.eth.getBalance(address),
        daiContract.methods.balanceOf(address).call()
      ]);

      const ethBalance = web.utils.fromWei(weiEthBalance);
      const daiBalance = web.utils.fromWei(weiDaiBalance);

      const { token } = loginResponse.data;

      localStorage.setItem(this.tokenKey, token);

      this.setState({
        isAuthenticated: true,
        user: {
          address,
          ethBalance,
          daiBalance
        },
        loading: false,
        web3Instance: web,
        daiContract
      });
    } catch (e) {
      return this.setState({
        error: "Could not authenticate user",
        loading: false
      });
    }
  };

  /**
   * @method transferToken
   * @description method for transferring token
   * @param {object} e  event object
   * @returns {undefined}
   */
  transferToken = async e => {
    if (!e) {
      return;
    }
    e.preventDefault();
    const {
      web3Instance,
      transferAddress,
      transferAmount,
      transferCurrency,
      user,
      daiContract
    } = this.state;

    if (Number(transferAmount) <= 0) {
      return this.setState({
        transferError: "Value must be more than 0"
      });
    }

    this.setState({
      transferLoading: true
    });

    const isEther = transferCurrency === "ether";
    const value = web3Instance.utils.toWei(transferAmount);
    const { address } = user;
    try {
      let receipt;

      if (isEther) {
        receipt = await web3Instance.eth.sendTransaction({
          from: address,
          to: transferAddress,
          value
        });
      } else {
        receipt = await daiContract.methods
          .transferFrom(user.address, transferAddress, value)
          .call();
      }

      const [weiEthBalance, weiDaiBalance] = await Promise.all([
        web3Instance.eth.getBalance(address),
        daiContract.methods.balanceOf(address).call()
      ]);

      const ethBalance = web3Instance.utils.fromWei(weiEthBalance);
      const daiBalance = web3Instance.utils.fromWei(weiDaiBalance);

      this.setState({
        transferLoading: false,
        user: {
          ...user,
          ethBalance,
          daiBalance
        },
        receipt
      });
    } catch (err) {
      this.setState({
        transferLoading: false,
        transferError: "Could not complete transfer"
      });
    }
  };

  getTransferMax = () => {
    const { transferCurrency, user } = this.state;
    const { ethBalance, daiBalance } = user;
    return transferCurrency === "ether" ? ethBalance : daiBalance;
  };

  /**
   * @method changeCurrency
   * @description method for changing active currency
   * @param {object} curr  currency
   * @returns {undefined}
   */
  changeCurrency = curr => {
    this.setState({
      receipt: null,
      transferError: "",
      transferCurrency: curr,
      transferAddress: "",
      transferAmount: ""
    });
  };

  /**
   * @method render
   * @returns {JSX} auth page
   */
  render() {
    const {
      isAuthenticated,
      user,
      loading,
      error,
      transferAddress,
      transferAmount,
      transferCurrency,
      transferLoading,
      transferError,
      receipt
    } = this.state;

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
              <Fragment>
                <div className="auth-info-section blue-bg blue-shadow">
                  <p>
                    Address: <span>{user.address}</span>
                  </p>
                  <div>
                    <h5>Balance</h5>
                    <p>
                      ETH: <span>{user.ethBalance}</span>
                    </p>
                    <p>
                      DAI: <span>{user.daiBalance}</span>
                    </p>
                  </div>
                </div>
                <form
                  className="transaction-section d-flex"
                  onSubmit={this.transferToken}
                >
                  <div className="transaction-currency-div centralised-items-div">
                    <button
                      type="button"
                      onClick={() => this.changeCurrency("ether")}
                      className={transferCurrency === "ether" ? "active" : ""}
                    >
                      ETH
                    </button>
                    <button
                      type="button"
                      onClick={() => this.changeCurrency("dai")}
                      className={transferCurrency === "dai" ? "active" : ""}
                    >
                      DAI
                    </button>
                  </div>
                  <div>
                    <input
                      type="number"
                      onChange={this.handleChange}
                      value={transferAmount}
                      placeholder={`Enter amount of ${transferCurrency} to send. Max (${this.getTransferMax()})`}
                      name="transferAmount"
                      required
                      max={this.getTransferMax()}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      onChange={this.handleChange}
                      value={transferAddress}
                      placeholder="Enter Address to send to"
                      name="transferAddress"
                      required
                      minLength={42}
                      maxLength={42}
                    />
                  </div>
                  {transferError && (
                    <div className="error-text info-text">{transferError}</div>
                  )}

                  {receipt && (
                    <div className="success-text info-text">
                      Transfer Successful <br />
                      {receipt.transactionHash && (
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://kovan.etherscan.io/tx/${receipt.transactionHash}`}
                        >
                          View
                        </a>
                      )}
                    </div>
                  )}

                  <button
                    disabled={transferLoading}
                    type="submit"
                    className="deposit-btn blue-bg blue-shadow"
                  >
                    {transferLoading ? "Sending" : "Send"}
                  </button>
                </form>
              </Fragment>
            )}
          </div>
        )}
      </Fragment>
    );
  }
}

export default AuthPage;
