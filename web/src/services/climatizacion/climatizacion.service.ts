import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClimatizacionEntity } from '../../entities/climatizacion/climatizacion.entity';

@Injectable()
export class ClimatizacionService {

    constructor(@InjectRepository(ClimatizacionEntity) private climatizacionRepository: Repository<ClimatizacionEntity>) { }

    /**
     * Retorna toda la información de la tabla
     * @returns Promise<ClimatizacionEntity[]>
     */
    async getAll(): Promise<ClimatizacionEntity[]> {
        return await this.climatizacionRepository.find();
    }

    /**
     * Retorna la información de la tabla por Id
     * @param id: number
     * @returns Promise<ClimatizacionEntity>
     */
    async getById(id: number): Promise<ClimatizacionEntity> {
        return await this.climatizacionRepository.findOne({ where: { climatizacion_id: id } });
    }

    /**
    * Retorna toda la información de movimientos
    * @param filter: string
    * @returns Promise<ClimatizacionEntity[]>
    */
    async getClimatizaciones(filter: string): Promise<ClimatizacionEntity[]> {
        /*
        return await this.climatizacionRepository.query(`
            SELECT c.climatizacion_id, d.nombre AS 'datacenter', c.temperatura, c.humedad, d.descripcion, c.fecha_hora 
            FROM climatizacion c
            INNER JOIN datacenter d ON d.datacenter_id = c.datacenter_id
            WHERE YEAR(c.fecha_hora)=YEAR(CURDATE())
                AND MONTH(c.fecha_hora)=MONTH(CURDATE())
                AND DAY(c.fecha_hora)=DAY(CURDATE())
            ORDER BY c.fecha_hora DESC, d.datacenter_id ASC
            LIMIT 6
        `);*/

        return await this.climatizacionRepository.query(`
            SELECT c.climatizacion_id, d.nombre AS 'datacenter', c.temperatura, c.humedad, d.descripcion, c.fecha_hora 
            FROM climatizacion c
            INNER JOIN datacenter d ON d.datacenter_id = c.datacenter_id
            WHERE c.fecha_hora >= CURDATE()
            ORDER BY c.fecha_hora DESC, d.datacenter_id ASC
            LIMIT 6
        `);
    }

    /**
    * Retorna toda la información de movimientos
    * @param filter: string
    * @returns Promise<ClimatizacionEntity[]>
    */
    async getClimatizacionesChart(filter: string): Promise<ClimatizacionEntity[]> {
        /*
        return await this.climatizacionRepository.query(`
            SELECT d.datacenter_id, c.climatizacion_id, d.nombre AS 'datacenter', c.temperatura, c.humedad, d.descripcion, DATE_FORMAT(c.fecha_hora, '%H:%m') AS 'hora'
            FROM climatizacion c
            INNER JOIN datacenter d ON d.datacenter_id = c.datacenter_id
            WHERE YEAR(c.fecha_hora)=YEAR(CURDATE()) 
                AND MONTH(c.fecha_hora)=MONTH(CURDATE()) 
                AND DAY(c.fecha_hora)=DAY(CURDATE())  
            GROUP BY 7, 3
            ORDER BY 7, 1
        `);*/

        return await this.climatizacionRepository.query(`
            SELECT d.datacenter_id, c.climatizacion_id, d.nombre AS 'datacenter', c.temperatura, c.humedad, d.descripcion, DATE_FORMAT(c.fecha_hora, '%H:%m') AS 'hora'
            FROM climatizacion c
            INNER JOIN datacenter d ON d.datacenter_id = c.datacenter_id
            WHERE c.fecha_hora >= CURDATE()  
            GROUP BY 7, 3
            ORDER BY 7, 1
        `);    
    }

}