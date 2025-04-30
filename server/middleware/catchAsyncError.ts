import { NextFunction, Request, Response } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

// Return a properly typed middleware function
export const catchAsyncError = (theFunc: AsyncRequestHandler): AsyncRequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(theFunc(req, res, next)).catch(next);
  };
};
