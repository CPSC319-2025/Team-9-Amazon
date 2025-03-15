import type { ErrorRequestHandler, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

const unexpectedRequest: RequestHandler = (_req, res) => {
  res.sendStatus(StatusCodes.NOT_FOUND);
};

const addErrorToRequestLog: ErrorRequestHandler = (err, _req, res, next) => {
  res.locals.err = err;
  next(err);
};

export const handleZodError = (error: any, res: Response, message: string) => {
  const errorDetails = error.errors ? error.errors.map((err: any) => err.message) : error.message ?? "Unknown error";
  
  return res.status(500).json({
    error: message,
    details: errorDetails,
  });
}

export default () => [unexpectedRequest, addErrorToRequestLog];
