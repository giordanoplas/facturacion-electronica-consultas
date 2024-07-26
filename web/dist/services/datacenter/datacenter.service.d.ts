import { Repository } from 'typeorm';
import { DatacenterEntity } from '../../entities/datacenter/datacenter.entity';
export declare class DatacenterService {
    private datacenterRepository;
    constructor(datacenterRepository: Repository<DatacenterEntity>);
    getAll(): Promise<DatacenterEntity[]>;
    getById(id: number): Promise<DatacenterEntity>;
}
