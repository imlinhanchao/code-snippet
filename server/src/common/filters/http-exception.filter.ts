import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const normalized =
      typeof payload === 'string'
        ? { code: 'HTTP_ERROR', message: payload }
        : (payload as Record<string, unknown> | undefined);

    response.status(status).json({
      success: false,
      error: {
        code: normalized?.code || 'INTERNAL_SERVER_ERROR',
        message:
          (normalized?.message as string | string[] | undefined) ||
          'Unexpected server error.',
        details: normalized?.details || null,
      },
      meta: {
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
