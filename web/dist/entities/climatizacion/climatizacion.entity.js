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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClimatizacionEntity = void 0;
const typeorm_1 = require("typeorm");
let ClimatizacionEntity = class ClimatizacionEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ClimatizacionEntity.prototype, "climatizacion_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: false }),
    __metadata("design:type", Number)
], ClimatizacionEntity.prototype, "datacenter_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", nullable: false }),
    __metadata("design:type", Number)
], ClimatizacionEntity.prototype, "temperatura", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", nullable: false }),
    __metadata("design:type", Number)
], ClimatizacionEntity.prototype, "humedad", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: false }),
    __metadata("design:type", String)
], ClimatizacionEntity.prototype, "fecha_hora", void 0);
ClimatizacionEntity = __decorate([
    (0, typeorm_1.Entity)('climatizacion')
], ClimatizacionEntity);
exports.ClimatizacionEntity = ClimatizacionEntity;
//# sourceMappingURL=climatizacion.entity.js.map