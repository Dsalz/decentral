// Middleware
import tokenizer from "../middleware/tokenizer";

export default {
  depositToken: async (req, res) => {
    try {
      const { signature, message } = req.body;
      return res.status(200).send({ ...user, token });
    } catch (e) {
      res.status(500).send(e);
    }
  }
};
