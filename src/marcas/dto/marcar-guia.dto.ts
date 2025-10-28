import { IsString, IsNumber, IsOptional, IsNotEmpty, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GuiaDto } from './guia.dto';

export class MarcarGuiaDto {
  @ApiProperty({ 
    description: 'Código del motivo de marca',
    example: 'F',
    enum: ['F', 'D', 'E', 'G', 'O', 'R', 'SEREMI', 'ISP', 'DGMN', 'SERNAPESCA', 'DF', 'PARTIDA']
  })
  @IsString()
  @IsNotEmpty()
  motivoMarca: string;

  @ApiProperty({ 
    description: 'Array de guías a marcar (mínimo 1)',
    type: [GuiaDto],
    example: [
      {
        idGuiaCourier: 18912826,
        numeroDocumento: '843712644220',
        codigoTipoDocumento: 'GTIME',
        tipoDocumento: 'GUIA TIME'
      }
    ]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos una guía' })
  @ValidateNested({ each: true })
  @Type(() => GuiaDto)
  guias: GuiaDto[];

  @ApiProperty({ 
    description: 'ID de la persona que marca',
    example: '12345'
  })
  @IsString()
  @IsNotEmpty()
  idPersona: string;

  @ApiProperty({ 
    description: 'Observación de la marca',
    example: 'Revisión manual requerida'
  })
  @IsString()
  @IsNotEmpty()
  observacion: string;

  @ApiPropertyOptional({ 
    description: 'Tipo de fiscalización',
    example: 'FISCALIZA'
  })
  @IsString()
  @IsOptional()
  tipoFiscalizacion?: string;

  @ApiPropertyOptional({ 
    description: 'Descripción de la acción',
    example: 'Marcado automático'
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ 
    description: 'Propuesta de la guía',
    example: 'LIBRE'
  })
  @IsString()
  @IsOptional()
  propuesta?: string;
}
