import { Injectable, Logger } from '@nestjs/common';
import { OracleService } from './oracle.service';
import { ConsultaMarcasDto } from './dto/consulta-marcas.dto';
import { ModificarMarcaDto } from './dto/modificar-marca.dto';
import { ConsultaGuiasCourierDto } from './dto/consulta-guias-courier.dto';
import { 
  InvalidMotivoMarcaException,
  GuiaNotFoundException 
} from '../common/exceptions/business.exception';

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
        this.logger.log(`Modificando marca de guía: ${modificarDto.idGuia}`);
        
        // Validar motivo de marca
        const motivosValidos = ['F', 'D', 'E', 'G', 'O', 'R', 'SEREMI', 'ISP', 'DGMN', 'SERNAPESCA', 'DF', 'PARTIDA'];
        if (!motivosValidos.includes(modificarDto.motivoMarca)) {
            throw new InvalidMotivoMarcaException(modificarDto.motivoMarca);
        }

        // Validar que la guía existe (simulación - en producción se validaría contra la BD)
        if (modificarDto.idGuia <= 0) {
            throw new GuiaNotFoundException(modificarDto.idGuia);
        }

        return await this.oracleService.modificarMarcaGuia(
            modificarDto.idGuia,
            modificarDto.motivoMarca,
            modificarDto.observacion
        );
    }

    async consultarGuiasCourier(consultaDto: ConsultaGuiasCourierDto) {
        this.logger.log(`Consultando guías courier para manifiesto: ${consultaDto.EdNroManifiesto}`);
        
        return await this.oracleService.consultarGuiasCourier(consultaDto.EdNroManifiesto, consultaDto.guiaCourier);
    }
}
