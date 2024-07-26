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
exports.ClimatizacionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const climatizacion_entity_1 = require("../../entities/climatizacion/climatizacion.entity");
let ClimatizacionService = class ClimatizacionService {
    constructor(climatizacionRepository) {
        this.climatizacionRepository = climatizacionRepository;
    }
    async getAll() {
        return await this.climatizacionRepository.find();
    }
    async getById(id) {
        return await this.climatizacionRepository.findOne({ where: { climatizacion_id: id } });
    }
    async getClimatizaciones(filter) {
        return await this.climatizacionRepository.query(`
            SELECT c.climatizacion_id, d.nombre AS 'datacenter', c.temperatura, c.humedad, d.descripcion, c.fecha_hora 
            FROM climatizacion c
            INNER JOIN datacenter d ON d.datacenter_id = c.datacenter_id
            WHERE c.fecha_hora >= CURDATE()
            ORDER BY c.fecha_hora DESC, d.datacenter_id ASC
            LIMIT 6
        `);
    }
    async getClimatizacionesChart(filter) {
        return await this.climatizacionRepository.query(`
            SELECT d.datacenter_id, c.climatizacion_id, d.nombre AS 'datacenter', c.temperatura, c.humedad, d.descripcion, DATE_FORMAT(c.fecha_hora, '%H:%m') AS 'hora'
            FROM climatizacion c
            INNER JOIN datacenter d ON d.datacenter_id = c.datacenter_id
            WHERE c.fecha_hora >= CURDATE()  
            GROUP BY 7, 3
            ORDER BY 7, 1
        `);
    }
};
ClimatizacionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(climatizacion_entity_1.ClimatizacionEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClimatizacionService);
exports.ClimatizacionService = ClimatizacionService;
//# sourceMappingURL=climatizacion.service.js.map