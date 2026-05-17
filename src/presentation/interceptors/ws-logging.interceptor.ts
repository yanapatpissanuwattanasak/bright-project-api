import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { Socket } from 'socket.io'

@Injectable()
export class WsLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('WsInterceptor')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'ws') return next.handle()

    const wsCtx = context.switchToWs()
    const client = wsCtx.getClient<Socket>()
    const data = wsCtx.getData()
    const event: string = Reflect.getMetadata('message', context.getHandler()) ?? context.getHandler().name
    const start = Date.now()

    this.logger.log(`→ [${event}] id=${client.id} payload=${JSON.stringify(data)}`)

    return next.handle().pipe(
      tap({
        next: () => this.logger.log(`← [${event}] id=${client.id} ${Date.now() - start}ms OK`),
        error: (err: Error) => this.logger.error(`← [${event}] id=${client.id} ${Date.now() - start}ms ERR=${err.message}`),
      }),
    )
  }
}
