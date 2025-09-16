import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validateInputData = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMsg = err.issues.map((issue) => ({
          message: `${issue.path.join(".")}: ${issue.message}`,
        }));
        res
          .status(400)
          .json({ status: false, error: "Invalid data", details: errorMsg });
      } else {
        throw new Error("Internal Server Error");
      }
    }
  };
};
