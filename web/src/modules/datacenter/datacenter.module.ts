import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatacenterService } from '../../services/datacenter/datacenter.service';
import { DatacenterController } from '../../controllers/datacenter/datacenter.controller';
import { DatacenterEntity } from '../../entities/datacenter/datacenter.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DatacenterEntity]), DatacenterModule],
    providers: [DatacenterService],
    controllers: [DatacenterController]
})

export class DatacenterModule { }