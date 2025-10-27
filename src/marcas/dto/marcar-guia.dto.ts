import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
    description: 'ID de la guía courier a marcar',
    example: 18912826
  })
  @IsNumber()
  idGuiaCourier: number;

  @ApiProperty({ 
    description: 'Número de la guía',
    example: '843712644220'
  })
  @IsString()
  @IsNotEmpty()
  numeroDocumento: string;

  @ApiProperty({ 
    description: 'Código del tipo de documento',
    example: 'GTIME'
  })
  @IsString()
  @IsNotEmpty()
  codigoTipoDocumento: string;

  @ApiProperty({ 
    description: 'Tipo de documento',
    example: 'GUIA TIME'
  })
  @IsString()
  @IsNotEmpty()
  tipoDocumento: string;

  @ApiProperty({ 
    description: 'ID de la persona que marca',
    example: 12345
  })
  @IsNumber()
  idPersona: number;

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
