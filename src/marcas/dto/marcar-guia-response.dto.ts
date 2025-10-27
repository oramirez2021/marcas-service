import { ApiProperty } from '@nestjs/swagger';

export class MarcarGuiaResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Guía marcada exitosamente' })
  message: string;

  @ApiProperty({ example: 'BIEN' })
  resultado: string;

  @ApiProperty({ example: 18912826 })
  idGuia: number;

  @ApiProperty({ example: 'F' })
  motivoMarca: string;

  @ApiProperty({ example: '2025-10-27T14:47:35.149Z' })
  timestamp: string;
}
