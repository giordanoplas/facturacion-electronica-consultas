import { DatacenterService } from '../../services/datacenter/datacenter.service';
export declare class DatacenterController {
    private datacenterService;
    constructor(datacenterService: DatacenterService);
    findAll(): Promise<import("../../entities/datacenter/datacenter.entity").DatacenterEntity[]>;
    findById(params: any): Promise<import("../../entities/datacenter/datacenter.entity").DatacenterEntity>;
}
