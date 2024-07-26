import { Controller, Get, Param } from '@nestjs/common';
import { DatacenterService } from '../../services/datacenter/datacenter.service';

@Controller('api/v1/datacenter')
export class DatacenterController {

    constructor(private datacenterService: DatacenterService) { }

    @Get()
    findAll() {
        return this.datacenterService.getAll();
    }

    @Get(':id')
    findById(@Param() params: any) {
        return this.datacenterService.getById(params.id);
    }
    
}