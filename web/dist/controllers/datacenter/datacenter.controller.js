"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatacenterController = void 0;
const common_1 = require("@nestjs/common");
const datacenter_service_1 = require("../../services/datacenter/datacenter.service");
let DatacenterController = class DatacenterController {
    constructor(datacenterService) {
        this.datacenterService = datacenterService;
    }
    findAll() {
        return this.datacenterService.getAll();
    }
    findById(params) {
        return this.datacenterService.getById(params.id);
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DatacenterController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DatacenterController.prototype, "findById", null);
DatacenterController = __decorate([
    (0, common_1.Controller)('api/v1/datacenter'),
    __metadata("design:paramtypes", [datacenter_service_1.DatacenterService])
], DatacenterController);
exports.DatacenterController = DatacenterController;
//# sourceMappingURL=datacenter.controller.js.map