import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('datacenter')
export class DatacenterEntity {
    @PrimaryGeneratedColumn()
    datacenter_id: number;

    @Column({ type: "varchar", length: 150, nullable: false })
    nombre: string;

    @Column({ type: "varchar", length: 300, nullable: true })
    descripcion: string;
}