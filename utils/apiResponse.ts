import { Response } from 'express';

export const apiResponse = (
  res: Response,
  statusCode: number,
  data: any
): Response => {
  return res.status(statusCode).json(data);
};