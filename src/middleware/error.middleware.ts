import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

export default errorMiddleware;
