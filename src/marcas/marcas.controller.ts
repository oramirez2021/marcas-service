import { Controller, Get, Post, Body, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';
import { MarcasService } from './marcas.service';
import { ConsultaMarcasDto } from './dto/consulta-marcas.dto';
import { ModificarMarcaDto } from './dto/modificar-marca.dto';
import { ConsultaGuiasCourierDto } from './dto/consulta-guias-courier.dto';
import { GuiasCourierResponseDto } from './dto/guias-courier-response.dto';
import { MarcarGuiaDto } from './dto/marcar-guia.dto';
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
        summary: 'Marcar guía courier',
        description: 'Marca una guía courier con motivo de fiscalización específico. Replica la funcionalidad del botón Aceptar en webfiscalizaciones.'
    })
    @ApiBody({
        type: MarcarGuiaDto,
        description: 'Datos para marcar la guía courier',
        examples: {
            ejemplo1: {
                summary: 'Marcar guía con motivo F',
                description: 'Ejemplo de marcado con motivo F (Fiscalización)',
                value: {
                    motivoMarca: 'F',
                    idGuiaCourier: 18912826,
                    numeroDocumento: '843712644220',
                    codigoTipoDocumento: 'GTIME',
                    tipoDocumento: 'GUIA TIME',
                    idPersona: 12345,
                    observacion: 'Revisión manual requerida por irregularidades detectadas',
                    tipoFiscalizacion: 'FISCALIZA',
                    descripcion: 'Marcado automático',
                    propuesta: 'LIBRE'
                }
            },
            ejemplo2: {
                summary: 'Marcar guía con motivo D',
                description: 'Ejemplo de marcado con motivo D (Declaración)',
                value: {
                    motivoMarca: 'D',
                    idGuiaCourier: 18912827,
                    numeroDocumento: '843712644221',
                    codigoTipoDocumento: 'GTIME',
                    tipoDocumento: 'GUIA TIME',
                    idPersona: 12345,
                    observacion: 'Declaración incompleta, requiere documentación adicional',
                    tipoFiscalizacion: 'FISCALIZA',
                    descripcion: 'Marcado por declaración',
                    propuesta: 'LIBRE'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Guía marcada exitosamente',
        type: MarcarGuiaResponseDto,
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Guía marcada exitosamente' },
                resultado: { type: 'string', example: 'BIEN' },
                idGuia: { type: 'number', example: 18912826 },
                motivoMarca: { type: 'string', example: 'F' },
                timestamp: { type: 'string', format: 'date-time', example: '2025-10-27T14:47:35.149Z' }
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Datos de entrada inválidos o motivo de marca inválido',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Guía no encontrada',
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
}
