import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConsultaGuiasCourierDto {
  @ApiProperty({ 
    description: 'Número de manifiesto (obligatorio)', 
    example: '12345',
    pattern: '^[0-9]+$'
  })
  @IsString()
  @IsNotEmpty()
  EdNroManifiesto: string;

  @ApiPropertyOptional({ 
    description: 'Número de guía courier específica para filtrar (opcional)', 
    example: '843712644220',
    pattern: '^[A-Z0-9]+$'
  })
  @IsString()
  @IsOptional()
  guiaCourier?: string;
}
