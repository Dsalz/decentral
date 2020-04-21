import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3080"
    : "https://decentral-challenge.herokuapp.com";

export default axios.create({ baseURL });
