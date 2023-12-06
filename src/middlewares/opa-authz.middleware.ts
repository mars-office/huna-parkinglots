import axios from "axios";
import { Request, Response, NextFunction } from "express";

export default async (req: Request, res: Response, next: NextFunction) => {
  if (req.url === "/api/parkinglots/health") {
    next();
    return;
  }
  const opaRequest = {
    input: {
      url: req.url,
      headers: req.headers,
      method: req.method.toUpperCase(),
      service: "huna-parkinglots",
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
};