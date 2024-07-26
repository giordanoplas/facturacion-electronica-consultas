"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ClimatizacionModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClimatizacionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const climatizacion_service_1 = require("../../services/climatizacion/climatizacion.service");
const climatizacion_controller_1 = require("../../controllers/climatizacion/climatizacion.controller");
const climatizacion_entity_1 = require("../../entities/climatizacion/climatizacion.entity");
let ClimatizacionModule = ClimatizacionModule_1 = class ClimatizacionModule {
};
ClimatizacionModule = ClimatizacionModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([climatizacion_entity_1.ClimatizacionEntity]), ClimatizacionModule_1],
        providers: [climatizacion_service_1.ClimatizacionService],
        controllers: [climatizacion_controller_1.ClimatizacionController]
    })
], ClimatizacionModule);
exports.ClimatizacionModule = ClimatizacionModule;
//# sourceMappingURL=climatizacion.module.js.map