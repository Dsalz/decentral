import {
  fromRpcSig,
  ecrecover,
  pubToAddress,
  bufferToHex,
  toBuffer,
  keccak
} from "ethereumjs-util";

// Models
import User from "../models/User";

// Middleware
import tokenizer from "../middleware/tokenizer";

export default {
  login: async (req, res) => {
    try {
      const { signature, message } = req.body;
      let nonce = `\x19Ethereum Signed Message:\n${message.length}${message}`;
      nonce = keccak(nonce);
      const { v, r, s } = fromRpcSig(signature);
      const publicKey = ecrecover(toBuffer(nonce), v, r, s);
      const addrBuf = pubToAddress(publicKey);
      const address = bufferToHex(addrBuf);
      let user = await User.findOne({ address });
      if (!user) {
        user = await User.create({
          address
        });
      }
      const token = await tokenizer.createToken(user);
      return res.status(200).send({ ...user, token });
    } catch (e) {
      res.status(500).send(e);
    }
  },
  refreshToken: async (req, res) => {
    const { user } = req;
    const token = await tokenizer.createToken(user);
    return res.status(200).send({ ...user, token });
  }
};
