import { Controller, Get, Post, Body, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';
import { MarcasService } from './marcas.service';
import { ConsultaMarcasDto } from './dto/consulta-marcas.dto';
import { ModificarMarcaDto } from './dto/modificar-marca.dto';
import { ConsultaGuiasCourierDto } from './dto/consulta-guias-courier.dto';
import { GuiasCourierResponseDto } from './dto/guias-courier-response.dto';
import { MarcarGuiaDto, CambiarMarcaDto } from './dto/marcar-guia.dto';
import { MarcarGuiaResponseDto } from './dto/marcar-guia-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('marcas')
@Controller('marcas')
@ApiBearerAuth()
export class MarcasController {
    constructor(private readonly marcasService: MarcasService) { }

    @Get('consulta')
    @ApiOperation({ 
        summary: 'Consultar guías con marcas',
        description: 'Obtiene la lista de guías que tienen marcas de fiscalización asociadas a un manifiesto específico'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Lista de guías con marcas obtenida exitosamente',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    docorigen: { type: 'string', example: 'GT123456' },
                    numerodoc: { type: 'string', example: '843712644220' },
                    nombreemisor: { type: 'string', example: 'FEDERAL EXPRESS' },
                    totalbultos: { type: 'number', example: 1 },
                    totalpeso: { type: 'number', example: 17 },
                    valordeclarado: { type: 'number', example: 36.92 },
                    consignante: { type: 'string', example: '843712644220' },
                    consignatario: { type: 'string', example: 'Juan Pérez' },
                    rutconsignatario: { type: 'string', example: '12345678-9' },
                    marcas: { type: 'string', example: 'F-REVISIÓN' },
                    motivoseleccion: { type: 'string', example: 'F' }
                }
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Parámetros de consulta inválidos',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Error interno del servidor',
        type: ErrorResponseDto
    })
    async consultarMarcas(@Query() consultaDto: ConsultaMarcasDto) {
        return await this.marcasService.consultarMarcas(consultaDto);
    }

    @Post('modificar')
    @ApiOperation({ 
        summary: 'Modificar marca de guía',
        description: 'Modifica el motivo y observaciones de una marca de fiscalización existente en una guía específica'
    })
    @ApiBody({
        type: ModificarMarcaDto,
        description: 'Datos para modificar la marca de la guía',
        examples: {
            ejemplo1: {
                summary: 'Modificar marca con motivo F',
                description: 'Ejemplo de modificación de marca con motivo F (Fiscalización)',
                value: {
                    idGuia: 67890,
                    motivoMarca: 'F',
                    observacion: 'Revisión manual requerida por irregularidades detectadas'
                }
            },
            ejemplo2: {
                summary: 'Modificar marca con motivo D',
                description: 'Ejemplo de modificación de marca con motivo D (Declaración)',
                value: {
                    idGuia: 67891,
                    motivoMarca: 'D',
                    observacion: 'Declaración incompleta, requiere documentación adicional'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Marca modificada exitosamente',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Marca modificada para guía 67890' },
                motivoMarca: { type: 'string', example: 'F' },
                observacion: { type: 'string', example: 'Revisión manual requerida' }
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Datos de entrada inválidos',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Guía no encontrada',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Error interno del servidor',
        type: ErrorResponseDto
    })
    async modificarMarca(@Body() modificarDto: ModificarMarcaDto) {
        return await this.marcasService.modificarMarca(modificarDto);
    }

    @Get('guias-courier')
    @ApiOperation({ 
        summary: 'Consultar guías courier por manifiesto',
        description: 'Obtiene la lista completa de guías courier asociadas a un manifiesto específico. Replica la funcionalidad de QGuiasCourier del sistema original.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Lista de guías courier obtenida exitosamente con contador de registros',
        type: GuiasCourierResponseDto,
        schema: {
            type: 'object',
            properties: {
                guias: {
                    type: 'array',
                    description: 'Lista de guías courier',
                    items: { $ref: '#/components/schemas/GuiaCourierResponseDto' }
                },
                rowsCount: {
                    type: 'number',
                    description: 'Número total de registros devueltos',
                    example: 402
                }
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Parámetros de consulta inválidos o manifiesto no encontrado',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Manifiesto no encontrado',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Error interno del servidor o error de conexión a base de datos',
        type: ErrorResponseDto
    })
    async consultarGuiasCourier(@Query() consultaDto: ConsultaGuiasCourierDto) {
        return await this.marcasService.consultarGuiasCourier(consultaDto);
    }

  @Post('marcar')
  @ApiOperation({ 
      summary: 'Marcar guías courier',
      description: 'Marca una o múltiples guías courier con motivo de fiscalización específico. Replica la funcionalidad del botón Aceptar en webfiscalizaciones.'
  })
  @ApiBody({
      type: MarcarGuiaDto,
      description: 'Datos para marcar las guías courier',
      examples: {
          ejemplo1: {
              summary: 'Marcar una guía con motivo F',
              description: 'Ejemplo de marcado con una guía y motivo F (Fiscalización)',
              value: {
                  motivoMarca: 'F',
                  guias: [
                      {
                          idGuiaCourier: 18912826,
                          numeroDocumento: '843712644220',
                          codigoTipoDocumento: 'GTIME',
                          tipoDocumento: 'GUIA TIME'
                      }
                  ],
                  idPersona: 12345,
                  observacion: 'Revisión manual requerida',
                  tipoFiscalizacion: 'FISCALIZA',
                  descripcion: 'Marcado automático',
                  propuesta: 'LIBRE'
              }
          },
          ejemplo2: {
              summary: 'Marcar múltiples guías con motivo D',
              description: 'Ejemplo de marcado con múltiples guías y motivo D (Declaración)',
              value: {
                  motivoMarca: 'D',
                  guias: [
                      {
                          idGuiaCourier: 18912826,
                          numeroDocumento: '843712644220',
                          codigoTipoDocumento: 'GTIME',
                          tipoDocumento: 'GUIA TIME'
                      },
                      {
                          idGuiaCourier: 18912827,
                          numeroDocumento: '843712644221',
                          codigoTipoDocumento: 'GTIME',
                          tipoDocumento: 'GUIA TIME'
                      }
                  ],
                  idPersona: 12345,
                  observacion: 'Marcado masivo por declaración incompleta',
                  tipoFiscalizacion: 'FISCALIZA',
                  descripcion: 'Marcado por declaración',
                  propuesta: 'LIBRE'
              }
          }
      }
  })
  @ApiResponse({ 
      status: 200, 
      description: 'Guías marcadas exitosamente',
      type: MarcarGuiaResponseDto
  })
  @ApiResponse({ 
      status: 400, 
      description: 'Datos de entrada inválidos, motivo de marca inválido o array de guías vacío',
      type: ErrorResponseDto
  })
  @ApiResponse({ 
      status: 404, 
      description: 'Una o más guías no encontradas',
      type: ErrorResponseDto
  })
  @ApiResponse({ 
      status: 500, 
      description: 'Error interno del servidor o error de conexión a base de datos',
      type: ErrorResponseDto
  })
  async marcarGuia(@Body() marcarDto: MarcarGuiaDto) {
      return await this.marcasService.marcarGuia(marcarDto);
  }

  @Post('cambiar-marca')
  @ApiOperation({ 
      summary: 'Cambiar marca de guías courier (Nueva Marca)',
      description: 'Descarta la marca anterior de una guía y crea una nueva. Replica la funcionalidad del botón "Nueva Marca" en webfiscalizaciones (ModMarca.jsp). Requiere motivoDescarte.'
  })
  @ApiBody({
      type: CambiarMarcaDto,
      description: 'Datos para cambiar la marca de las guías courier',
      examples: {
          ejemplo1: {
              summary: 'Cambiar marca de F a ISP',
              description: 'Ejemplo de cambio de marca de motivo F a ISP con motivo descarte',
              value: {
                  motivoMarca: 'ISP',
                  guias: [
                      {
                          idGuiaCourier: 18912826,
                          numeroDocumento: '843712644220',
                          codigoTipoDocumento: 'GTIME',
                          tipoDocumento: 'GUIA TIME'
                      }
                  ],
                  idPersona: '12345',
                  observacion: 'mercancia encontra',
                  motivoDescarte: 'en realidad necesita',
                  tipoFiscalizacion: 'COURIER',
                  descripcion: 'visto bueno ISP'
              }
          },
          ejemplo2: {
              summary: 'Cambiar marca múltiples guías',
              description: 'Cambiar marca de D a F en múltiples guías',
              value: {
                  motivoMarca: 'F',
                  guias: [
                      {
                          idGuiaCourier: 18912826,
                          numeroDocumento: '843712644220',
                          codigoTipoDocumento: 'GTIME',
                          tipoDocumento: 'GUIA TIME'
                      },
                      {
                          idGuiaCourier: 18912827,
                          numeroDocumento: '843712644221',
                          codigoTipoDocumento: 'GTIME',
                          tipoDocumento: 'GUIA TIME'
                      }
                  ],
                  idPersona: '12345',
                  observacion: 'Cambio masivo de marca',
                  motivoDescarte: 'Corrección por error en motivo anterior',
                  tipoFiscalizacion: 'COURIER',
                  descripcion: 'Marcado correctivo'
              }
          }
      }
  })
  @ApiResponse({ 
      status: 200, 
      description: 'Marcas cambiadas exitosamente',
      type: MarcarGuiaResponseDto
  })
  @ApiResponse({ 
      status: 400, 
      description: 'Datos inválidos, motivo descarte faltante o muy corto',
      type: ErrorResponseDto
  })
  @ApiResponse({ 
      status: 404, 
      description: 'Una o más guías no encontradas',
      type: ErrorResponseDto
  })
  @ApiResponse({ 
      status: 500, 
      description: 'Error interno del servidor',
      type: ErrorResponseDto
  })
  async cambiarMarca(@Body() cambiarDto: CambiarMarcaDto) {
      return await this.marcasService.cambiarMarca(cambiarDto);
  }
}
