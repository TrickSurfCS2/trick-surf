import { NotFoundError, ValidationError } from 'elysia'
import { logger } from './logger'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: Record<string, unknown>

  constructor(
    statusCode: number,
    message: string,
    code = 'APP_ERROR',
    details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export interface ProcessedError {
  status: number
  code: string
  message: string
  error: string
  errorCode: number
  details?: Record<string, unknown>
}

export function extractErrorInfo(error: unknown): ProcessedError {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      errorCode: error.statusCode,
      code: error.code,
      message: error.message,
      error: error.message,
      details: error.details,
    }
  }

  if (error instanceof ValidationError) {
    let msg = 'Validation error'
    try {
      const parsed = JSON.parse(error.message)
      msg = parsed.summary || parsed.message || msg
    }
    catch {
      msg = error.message || msg
    }
    return {
      status: 400,
      errorCode: 400,
      code: 'VALIDATION_ERROR',
      message: msg,
      error: msg,
    }
  }

  if (error instanceof NotFoundError) {
    return {
      status: 404,
      errorCode: 404,
      code: 'NOT_FOUND',
      message: error.message || 'Not Found',
      error: error.message || 'Not Found',
    }
  }

  const errMessage = error instanceof Error ? error.message : 'Internal Server Error'

  return {
    status: 500,
    errorCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: errMessage,
    error: errMessage,
  }
}

export function handleElysiaError({
  error,
  set,
}: {
  error: unknown
  set: { status?: number | string }
}): ProcessedError {
  const processed = extractErrorInfo(error)
  set.status = processed.status

  if (processed.status >= 500) {
    logger.error(error, '[Server Error]')
  }

  return processed
}
