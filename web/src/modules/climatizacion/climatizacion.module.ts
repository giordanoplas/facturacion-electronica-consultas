import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClimatizacionService } from '../../services/climatizacion/climatizacion.service';
import { ClimatizacionController } from '../../controllers/climatizacion/climatizacion.controller';
import { ClimatizacionEntity } from '../../entities/climatizacion/climatizacion.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ClimatizacionEntity]), ClimatizacionModule],
    providers: [ClimatizacionService],
    controllers: [ClimatizacionController]
})

export class ClimatizacionModule { }