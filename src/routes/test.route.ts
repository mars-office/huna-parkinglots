import { Request, Response, Router } from "express";
import db from "../services/mongodb.service";

const testRouter = Router();

testRouter.get("/api/parkinglots/test", async (req: Request, res: Response) => {
  const dbTest = await db.collection("gigel").find().toArray();
  console.log(dbTest);
  res.send("Test OK 3333");
});

export default testRouter;