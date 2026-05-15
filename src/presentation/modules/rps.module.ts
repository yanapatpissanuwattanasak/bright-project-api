import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RpsGateway } from '../gateways/rps.gateway'
import { CreateRoomUseCase } from '@application/use-cases/rps/create-room.use-case'
import { JoinRoomUseCase } from '@application/use-cases/rps/join-room.use-case'
import { SelectHeroUseCase } from '@application/use-cases/rps/select-hero.use-case'
import { SubmitChoiceUseCase } from '@application/use-cases/rps/submit-choice.use-case'
import { I_RPS_ROOM_REPOSITORY } from '@domain/repositories/i-rps-room.repository'
import { RpsRoomOrmEntity } from '@infrastructure/database/orm-entities/rps-room.orm-entity'
import { RpsRoomTypeormRepository } from '@infrastructure/database/repositories/rps-room.typeorm-repository'

@Module({
  imports: [TypeOrmModule.forFeature([RpsRoomOrmEntity])],
  providers: [
    RpsGateway,
    CreateRoomUseCase,
    JoinRoomUseCase,
    SelectHeroUseCase,
    SubmitChoiceUseCase,
    { provide: I_RPS_ROOM_REPOSITORY, useClass: RpsRoomTypeormRepository },
  ],
})
export class RpsModule {}
