import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ModificarMarcaDto {
    @ApiProperty({ 
        description: 'ID único de la guía courier a modificar', 
        example: 67890,
        minimum: 1
    })
    @IsNumber()
    idGuia: number;

    @ApiProperty({ 
        description: 'Código del motivo de la marca de fiscalización', 
        example: 'F',
        enum: ['F', 'D', 'E', 'G', 'O', 'R', 'SEREMI', 'ISP', 'DGMN', 'SERNAPESCA', 'DF', 'PARTIDA'],
        enumName: 'MotivoMarca'
    })
    @IsString()
    motivoMarca: string;

    @ApiProperty({ 
        description: 'Observación adicional sobre la modificación de la marca', 
        example: 'Revisión manual requerida por irregularidades detectadas', 
        required: false,
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    observacion?: string;
}
