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
exports.ClimatizacionController = void 0;
const common_1 = require("@nestjs/common");
const climatizacion_service_1 = require("../../services/climatizacion/climatizacion.service");
let ClimatizacionController = class ClimatizacionController {
    constructor(climatizacionService) {
        this.climatizacionService = climatizacionService;
    }
    findAll() {
        return this.climatizacionService.getAll();
    }
    findById(params) {
        return this.climatizacionService.getById(params.id);
    }
    findClimatizaciones(params) {
        return this.climatizacionService.getClimatizaciones(params.filter);
    }
    findClimatizacionesChart(params) {
        return this.climatizacionService.getClimatizacionesChart(params.filter);
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ClimatizacionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClimatizacionController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('climatizaciones/:filter'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClimatizacionController.prototype, "findClimatizaciones", null);
__decorate([
    (0, common_1.Get)('climatizaciones-chart/:filter'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClimatizacionController.prototype, "findClimatizacionesChart", null);
ClimatizacionController = __decorate([
    (0, common_1.Controller)('api/v1/climatizacion'),
    __metadata("design:paramtypes", [climatizacion_service_1.ClimatizacionService])
], ClimatizacionController);
exports.ClimatizacionController = ClimatizacionController;
//# sourceMappingURL=climatizacion.controller.js.map