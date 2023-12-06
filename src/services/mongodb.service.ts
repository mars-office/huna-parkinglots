import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(
  `mongodb://admin:${process.env.MONGODB_PASSWORD}@huna-mongodb:27017/`,
  {
    appName: "huna-parkinglots",
  }
);
export const db = mongoClient.db("huna-parkinglots");
export default db;