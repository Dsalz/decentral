import express from "express";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import userRouter from "./routes/user";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.static(path.resolve(__dirname, "./dist")));

app.use("/api/users", userRouter);

app.use("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./dist/index.html"));
});

const databaseUrl = `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@ds111425.mlab.com:11425/decentraldb`;

// Set port
const port = parseInt(process.env.PORT, 10) || 3080;

// Connect to database and listen to port
mongoose
  .connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(port));

export default app;
