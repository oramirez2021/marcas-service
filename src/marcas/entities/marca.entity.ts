import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('marcas')
export class MarcaEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_guia' })
    idGuia: number;

    @Column({ name: 'motivo_marca', length: 50 })
    motivoMarca: string;

    @Column({ name: 'observacion', type: 'text', nullable: true })
    observacion?: string;

    @Column({ name: 'activa', default: true })
    activa: boolean;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}
