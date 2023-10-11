import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(
  `mongodb://admin:${process.env.MONGODB_PASSWORD}@huna-mongodb:27017/`,
  {
    appName: "huna-gpt",
  }
);
export const db = mongoClient.db("huna-gpt");
export default db;