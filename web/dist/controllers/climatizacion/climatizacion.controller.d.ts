import { ClimatizacionService } from '../../services/climatizacion/climatizacion.service';
export declare class ClimatizacionController {
    private climatizacionService;
    constructor(climatizacionService: ClimatizacionService);
    findAll(): Promise<import("../../entities/climatizacion/climatizacion.entity").ClimatizacionEntity[]>;
    findById(params: any): Promise<import("../../entities/climatizacion/climatizacion.entity").ClimatizacionEntity>;
    findClimatizaciones(params: any): Promise<import("../../entities/climatizacion/climatizacion.entity").ClimatizacionEntity[]>;
    findClimatizacionesChart(params: any): Promise<import("../../entities/climatizacion/climatizacion.entity").ClimatizacionEntity[]>;
}
