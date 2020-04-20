import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.SECRET_KEY;

export default {
  createToken: user =>
    new Promise((resolve, reject) => {
      jwt.sign({ user }, secretKey, (err, token) => {
        if (err) {
          reject(err);
        }
        resolve(token);
      });
    }),

  verifyToken: (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({
        error: "Request has no Token"
      });
    }

    const token = authorization.split(" ")[1];
    return jwt.verify(token, secretKey, (err, data) => {
      if (err) {
        return res.status(401).json({
          error: "Invalid Token"
        });
      }
      req.user = data.user;
      return next();
    });
  }
};
