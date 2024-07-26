import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatacenterEntity } from '../../entities/datacenter/datacenter.entity';

@Injectable()
export class DatacenterService {

    constructor(@InjectRepository(DatacenterEntity) private datacenterRepository: Repository<DatacenterEntity>) { }

    /**
     * Retorna toda la información de la tabla
     * @returns Promise<DatacenterEntity[]>
     */
    async getAll(): Promise<DatacenterEntity[]> {
        return await this.datacenterRepository.find();
    }

    /**
     * Retorna la información de la tabla por Id
     * @param id: number
     * @returns Promise<DatacenterEntity>
     */
    async getById(id: number): Promise<DatacenterEntity> {
        return await this.datacenterRepository.findOne({ where: { datacenter_id: id } });
    }

}