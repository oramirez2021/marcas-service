import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConsultaMarcasDto {
    @ApiProperty({ description: 'ID del manifiesto', example: 12345 })
    @IsNumber()
    idManifiesto: number;

    @ApiProperty({ description: 'Tipo de acción', example: 'VIS', required: false })
    @IsOptional()
    @IsString()
    tipoAccion?: string;

    @ApiProperty({ description: 'Número de guía courier', example: 'GT123456', required: false })
    @IsOptional()
    @IsString()
    guiaCourier?: string;
}
