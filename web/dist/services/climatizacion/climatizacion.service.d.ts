import { Repository } from 'typeorm';
import { ClimatizacionEntity } from '../../entities/climatizacion/climatizacion.entity';
export declare class ClimatizacionService {
    private climatizacionRepository;
    constructor(climatizacionRepository: Repository<ClimatizacionEntity>);
    getAll(): Promise<ClimatizacionEntity[]>;
    getById(id: number): Promise<ClimatizacionEntity>;
    getClimatizaciones(filter: string): Promise<ClimatizacionEntity[]>;
    getClimatizacionesChart(filter: string): Promise<ClimatizacionEntity[]>;
}
