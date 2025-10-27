import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConsultaMarcasDto {
    @ApiProperty({ 
        description: 'ID único del manifiesto en el sistema', 
        example: 12345,
        minimum: 1
    })
    @IsNumber()
    idManifiesto: number;

    @ApiProperty({ 
        description: 'Tipo de acción de fiscalización a filtrar', 
        example: 'VIS', 
        required: false,
        enum: ['VIS', 'MARCA', 'F', 'D', 'E', 'G', 'O', 'R'],
        enumName: 'TipoAccion'
    })
    @IsOptional()
    @IsString()
    tipoAccion?: string;

    @ApiProperty({ 
        description: 'Número de guía courier específica para filtrar', 
        example: 'GT123456', 
        required: false,
        pattern: '^[A-Z0-9]+$'
    })
    @IsOptional()
    @IsString()
    guiaCourier?: string;
}
