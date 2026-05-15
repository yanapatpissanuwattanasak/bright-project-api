import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScheduleModule } from '@nestjs/schedule'
import { ProjectsModule } from './projects.module'
import { ContactModule } from './contact.module'
import { AdminModule } from './admin.module'
import { AuthModule } from './auth.module'
import { RpsModule } from './rps.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
    }),
    ScheduleModule.forRoot(),
    ProjectsModule,
    ContactModule,
    AdminModule,
    AuthModule,
    RpsModule,
  ],
})
export class AppModule {}
