import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, { success: true; data: T; meta: { timestamp: string; path: string } }>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<{ success: true; data: T; meta: { timestamp: string; path: string } }> {
    const request = context.switchToHttp().getRequest<Request & { url: string }>();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          path: request.url,
        },
      })),
    );
  }
}
