import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Response } from 'express'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter')

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() === 'ws') {
      this.logger.error('Unhandled WebSocket exception', exception)
      return
    }

    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const body = exception.getResponse() as Record<string, unknown>
      response.status(status).json({
        success: false,
        error: {
          code: body['code'] ?? this.statusToCode(status),
          message: body['message'] ?? exception.message,
          details: body['details'] ?? undefined,
        },
      })
      return
    }

    this.logger.error('Unhandled exception', exception)
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    })
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      422: 'PUBLISH_PRECONDITION_FAILED',
      429: 'RATE_LIMITED',
    }
    return map[status] ?? 'INTERNAL_ERROR'
  }
}
