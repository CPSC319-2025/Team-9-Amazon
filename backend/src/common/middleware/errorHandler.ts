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
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: "Validation error",
      details: error.errors,
    });
  }

  res.status(500).json({
    error: message,
    details: error instanceof Error ? error.message : "Unknown error",
  });
}

export default () => [unexpectedRequest, addErrorToRequestLog];
