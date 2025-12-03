import type { Request, Response, NextFunction } from "express"

export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("[ERROR]", err)

  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message })
  }

  res.status(500).json({ error: "Internal server error" })
}
