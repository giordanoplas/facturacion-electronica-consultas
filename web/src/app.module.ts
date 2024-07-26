import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

//Entities
import { DatacenterEntity } from './entities/datacenter/datacenter.entity';
import { ClimatizacionEntity } from './entities/climatizacion/climatizacion.entity';

//Modules
import { DatacenterModule } from './modules/datacenter/datacenter.module';
import { ClimatizacionModule } from './modules/climatizacion/climatizacion.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_SCHEMA,
      entities: [DatacenterEntity, ClimatizacionEntity],
      autoLoadEntities: true
    }),
    DatacenterModule,
    ClimatizacionModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
