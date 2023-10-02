import express, { Request, Response, Application } from "express";
import dotenv from "dotenv";
import axios from "axios";

// For env File
dotenv.config();

const app: Application = express();

app.use(async (req, res, next) => {
  const opaRequest = {
    input: {
      url: req.url,
      headers: req.headers,
      method: req.method.toUpperCase(),
      service: 'huna-gpt'
    },
  };
  const response = await axios.post(
    "http://localhost:8181/v1/data/com/huna/allow",
    opaRequest
  );
  const allowed = response.data.result;
  if (allowed) {
    next();
  } else {
    res.sendStatus(403);
  }
});

app.get("/api/gpt/health", (req: Request, res: Response) => {
  res.send("OK");
});

app.listen(3001, () => {
  console.log(`Server is Fire at http://localhost:3001`);
});
