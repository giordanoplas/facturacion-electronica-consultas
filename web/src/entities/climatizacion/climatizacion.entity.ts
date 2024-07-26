import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('climatizacion')
export class ClimatizacionEntity {
    @PrimaryGeneratedColumn()
    climatizacion_id: number;

    @Column({ type: "int", nullable: false })
    datacenter_id: number;

    @Column({ type: "float", nullable: false })
    temperatura: number;

    @Column({ type: "float", nullable: false })
    humedad: number;

    @Column({ type: "timestamp", nullable: false })
    fecha_hora: string;
}