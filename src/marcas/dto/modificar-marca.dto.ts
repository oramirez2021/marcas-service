import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ModificarMarcaDto {
    @ApiProperty({ description: 'ID de la guía', example: 67890 })
    @IsNumber()
    idGuia: number;

    @ApiProperty({ description: 'Motivo de la marca', example: 'F' })
    @IsString()
    motivoMarca: string;

    @ApiProperty({ description: 'Observación adicional', example: 'Revisión manual requerida', required: false })
    @IsOptional()
    @IsString()
    observacion?: string;
}
