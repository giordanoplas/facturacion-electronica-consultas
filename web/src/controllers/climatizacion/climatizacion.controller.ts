import { Controller, Get, Param } from '@nestjs/common';
import { ClimatizacionService } from '../../services/climatizacion/climatizacion.service';

@Controller('api/v1/climatizacion')
export class ClimatizacionController {

    constructor(private climatizacionService: ClimatizacionService) { }

    @Get()
    findAll() {
        return this.climatizacionService.getAll();
    }

    @Get(':id')
    findById(@Param() params: any) {
        return this.climatizacionService.getById(params.id);
    }

    @Get('climatizaciones/:filter')
    findClimatizaciones(@Param() params: any) {
        return this.climatizacionService.getClimatizaciones(params.filter);
    }

    @Get('climatizaciones-chart/:filter')
    findClimatizacionesChart(@Param() params: any) {
        return this.climatizacionService.getClimatizacionesChart(params.filter);
    }

}