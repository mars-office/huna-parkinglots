import { Request, Response, Router } from "express";

const healthCheckRouter = Router();

healthCheckRouter.get("/api/gpt/health", (_: Request, res: Response) => {
  res.send("OK");
});

export default healthCheckRouter;