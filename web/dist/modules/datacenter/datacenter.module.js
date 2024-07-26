"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatacenterModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatacenterModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const datacenter_service_1 = require("../../services/datacenter/datacenter.service");
const datacenter_controller_1 = require("../../controllers/datacenter/datacenter.controller");
const datacenter_entity_1 = require("../../entities/datacenter/datacenter.entity");
let DatacenterModule = DatacenterModule_1 = class DatacenterModule {
};
DatacenterModule = DatacenterModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([datacenter_entity_1.DatacenterEntity]), DatacenterModule_1],
        providers: [datacenter_service_1.DatacenterService],
        controllers: [datacenter_controller_1.DatacenterController]
    })
], DatacenterModule);
exports.DatacenterModule = DatacenterModule;
//# sourceMappingURL=datacenter.module.js.map