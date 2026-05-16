import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { map, Observable } from 'rxjs'

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    if (context.getType() === 'ws') {
      return next.handle()
    }
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data ?? null,
      })),
    )
  }
}
