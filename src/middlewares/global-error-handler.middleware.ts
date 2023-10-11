import { Request, Response, NextFunction } from "express";

export default (err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    error: err?.message,
  });
};
