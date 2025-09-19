import { Request, Response, NextFunction } from "express";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    message: "Authentication required",
    authenticated: false,
  });
};

export const isNotAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  return res.status(400).json({
    message: "Already authenticated",
    authenticated: true,
  });
};
