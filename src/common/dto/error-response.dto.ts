import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ 
    example: false,
    description: 'Indica si la operación fue exitosa'
  })
  success: boolean;

  @ApiProperty({
    type: 'object',
    description: 'Detalles del error',
    properties: {
      code: {
        type: 'string',
        description: 'Código único del error',
        example: 'MANIFIESTO_NOT_FOUND'
      },
      message: {
        type: 'string',
        description: 'Mensaje descriptivo del error',
        example: 'No se encontró manifiesto con número: 12345'
      },
      details: {
        type: 'object',
        description: 'Información adicional del error',
        example: { manifiesto: '12345' }
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp del error',
        example: '2025-10-26T21:51:17.000Z'
      },
      path: {
        type: 'string',
        description: 'Ruta del endpoint que causó el error',
        example: '/marcas/guias-courier'
      },
      method: {
        type: 'string',
        description: 'Método HTTP que causó el error',
        example: 'GET'
      }
    }
  })
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
    method: string;
  };

  @ApiProperty({
    required: false,
    description: 'Stack trace del error (solo en desarrollo)',
    example: 'Error: ...\n    at ...'
  })
  stack?: string;
}
