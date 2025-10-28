import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GuiaDto {
  @ApiProperty({ 
    description: 'ID de la guía courier',
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
}
