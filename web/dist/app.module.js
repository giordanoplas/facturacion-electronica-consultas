"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const datacenter_entity_1 = require("./entities/datacenter/datacenter.entity");
const climatizacion_entity_1 = require("./entities/climatizacion/climatizacion.entity");
const datacenter_module_1 = require("./modules/datacenter/datacenter.module");
const climatizacion_module_1 = require("./modules/climatizacion/climatizacion.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: '172.20.0.60',
                port: 3306,
                username: 'usistemas',
                password: 'CCsys@tom2022$',
                database: 'dbclimatizacionccibao',
                entities: [datacenter_entity_1.DatacenterEntity, climatizacion_entity_1.ClimatizacionEntity],
                autoLoadEntities: true
            }),
            datacenter_module_1.DatacenterModule,
            climatizacion_module_1.ClimatizacionModule
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map