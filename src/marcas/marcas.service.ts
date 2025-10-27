import { Injectable, Logger } from '@nestjs/common';
import { OracleService } from './oracle.service';
import { ConsultaMarcasDto } from './dto/consulta-marcas.dto';
import { ModificarMarcaDto } from './dto/modificar-marca.dto';

@Injectable()
export class MarcasService {
    private readonly logger = new Logger(MarcasService.name);

    constructor(private readonly oracleService: OracleService) { }

    async consultarMarcas(consultaDto: ConsultaMarcasDto) {
        this.logger.log('Consultando guías con marcas');
        return await this.oracleService.consultarGuiasConMarcas(
            consultaDto.idManifiesto,
            consultaDto.tipoAccion,
            consultaDto.guiaCourier
        );
    }

    async modificarMarca(modificarDto: ModificarMarcaDto) {
        this.logger.log('Modificando marca de guía');
        return await this.oracleService.modificarMarcaGuia(
            modificarDto.idGuia,
            modificarDto.motivoMarca,
            modificarDto.observacion
        );
    }
}
