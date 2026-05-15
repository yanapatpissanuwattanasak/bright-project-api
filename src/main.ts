import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import * as cookieParser from 'cookie-parser'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { AppModule } from './presentation/modules/app.module'
import { GlobalExceptionFilter } from './presentation/filters/global-exception.filter'
import { ResponseTransformInterceptor } from './presentation/interceptors/response-transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173').split(',').map(s => s.trim())
  app.enableCors({
    origin: (origin, cb) => {
      const ok = !origin
        || allowedOrigins.includes(origin)
        || /^http:\/\/localhost(:\d+)?$/.test(origin)
      cb(null, ok)
    },
    credentials: true,
  })

  app.use(cookieParser())

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.useGlobalFilters(new GlobalExceptionFilter())
  app.useGlobalInterceptors(new ResponseTransformInterceptor())

  app.useWebSocketAdapter(new IoAdapter(app))

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log(`API running on http://localhost:${port}`)
}

bootstrap()
