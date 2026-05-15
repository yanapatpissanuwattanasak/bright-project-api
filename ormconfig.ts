import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'

dotenv.config()

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/infrastructure/database/orm-entities/*.orm-entity.ts'],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
})
