import {
  fromRpcSig,
  ecrecover,
  publicToAddress,
  bufferToHex,
  toBuffer,
  hashPersonalMessage
} from "ethereumjs-util";
import dotenv from "dotenv";

// Models
import User from "../models/User";

// Middleware
import tokenizer from "../middleware/tokenizer";

dotenv.config();

export default {
  login: async (req, res) => {
    try {
      const { signature, message } = req.body;
      const currentTime = Date.now();
      const sigTime = Number(message.substring(2));
      const sigValidity = Number(process.env.SIGNATURE_VALIDITY);
      const maxSigValidTime = sigTime + sigValidity;

      if (maxSigValidTime < currentTime) {
        return res.status(401).send({ message: "Signature Expired" });
      }

      const msgHash = hashPersonalMessage(toBuffer(message));
      const { v, r, s } = fromRpcSig(toBuffer(signature));
      const publicKey = ecrecover(msgHash, v, r, s);
      const addrBuf = publicToAddress(publicKey);
      const address = bufferToHex(addrBuf);

      if (address !== req.body.address) {
        return res.status(401).send({ message: "Invalid Signature" });
      }

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
