import { ApiProperty } from '@nestjs/swagger';

export class ResultadoGuiaDto {
  @ApiProperty({ example: 18912826 })
  idGuia: number;

  @ApiProperty({ example: '843712644220' })
  numeroDocumento: string;

  @ApiProperty({ example: 'BIEN' })
  resultado: string;

  @ApiProperty({ example: true })
  success: boolean;
}

export class MarcarGuiaResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Guías marcadas exitosamente' })
  message: string;

  @ApiProperty({ example: 2 })
  totalGuias: number;

  @ApiProperty({ example: 2 })
  guiasMarcadas: number;

  @ApiProperty({ example: 0 })
  guiasConError: number;

  @ApiProperty({ example: 'F' })
  motivoMarca: string;

  @ApiProperty({ example: '2025-10-27T14:47:35.149Z' })
  timestamp: string;

  @ApiProperty({ 
    description: 'Detalle de cada guía procesada',
    type: [ResultadoGuiaDto]
  })
  resultados: ResultadoGuiaDto[];
}
