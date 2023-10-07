import express, { Request, Response, Application, NextFunction } from "express";
import dotenv from "dotenv";
import axios from "axios";
import { MongoClient } from 'mongodb';

// For env File
dotenv.config();

const app: Application = express();

const mongoClient = new MongoClient(`mongodb://admin:${process.env.MONGODB_PASSWORD}@huna-mongodb:27017/`, {
  appName: 'huna-gpt',
});
const db = mongoClient.db('huna-gpt')

app.use(async (req, res, next) => {
  if (req.url === "/api/gpt/health") {
    next();
    return;
  }
  const opaRequest = {
    input: {
      url: req.url,
      headers: req.headers,
      method: req.method.toUpperCase(),
      service: "huna-gpt",
      remoteAddress: req.ip,
    },
  };
  const response = await axios.post(
    `http://127.0.0.1:8181/v1/data/com/huna/allow`,
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

app.get("/api/gpt/test", async (req: Request, res: Response) => {
  const dbTest = await db.collection('gigel').find().toArray();
  console.log(dbTest);
  res.send("Test OK 22222");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    error: err?.message,
  });
});

app.listen(3001, () => {
  console.log(`Server is Fire at http://localhost:3001`);
});

process.on('SIGINT', () => {
  process.exit();
});