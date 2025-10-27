import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MarcasService } from './marcas.service';
import { ConsultaMarcasDto } from './dto/consulta-marcas.dto';
import { ModificarMarcaDto } from './dto/modificar-marca.dto';

@ApiTags('marcas')
@Controller('marcas')
export class MarcasController {
    constructor(private readonly marcasService: MarcasService) { }

    @Get('consulta')
    @ApiOperation({ summary: 'Consultar guías con marcas' })
    @ApiResponse({ status: 200, description: 'Lista de guías con marcas' })
    async consultarMarcas(@Query() consultaDto: ConsultaMarcasDto) {
        return await this.marcasService.consultarMarcas(consultaDto);
    }

    @Post('modificar')
    @ApiOperation({ summary: 'Modificar marca de guía' })
    @ApiResponse({ status: 200, description: 'Marca modificada exitosamente' })
    async modificarMarca(@Body() modificarDto: ModificarMarcaDto) {
        return await this.marcasService.modificarMarca(modificarDto);
    }
}
