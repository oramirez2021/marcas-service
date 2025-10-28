import { Injectable, Logger } from '@nestjs/common';
import { OracleService } from './oracle.service';
import { ConsultaMarcasDto } from './dto/consulta-marcas.dto';
import { ModificarMarcaDto } from './dto/modificar-marca.dto';
import { ConsultaGuiasCourierDto } from './dto/consulta-guias-courier.dto';
import { MarcarGuiaDto } from './dto/marcar-guia.dto';
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

  async marcarGuia(marcarDto: MarcarGuiaDto) {
    this.logger.log(`Marcando ${marcarDto.guias.length} guías`);
    
    // TODO: Implementar validación real de estado CMP
    // Ver documentos para obtener la lógica correcta de DocumentosDAO.getDocTieneEstado()
    const estadoCMP = true; // TEMPORAL - hardcodeado para testing
    
    if (!estadoCMP) {
      throw new Error('El Manifiesto no se encuentra CONSOLIDADO');
    }
    
    const motivosValidos = ['F', 'D', 'E', 'G', 'O', 'R', 'SEREMI', 'ISP', 'DGMN', 'SERNAPESCA', 'DF', 'PARTIDA'];
    if (!motivosValidos.includes(marcarDto.motivoMarca)) {
      throw new InvalidMotivoMarcaException(marcarDto.motivoMarca);
    }

    if (marcarDto.guias.length === 0) {
      throw new Error('Debe seleccionar al menos una guía para marcar');
    }

    const resultados = [];
    let guiasMarcadas = 0;
    let guiasConError = 0;

    for (const guia of marcarDto.guias) {
      try {
        if (guia.idGuiaCourier <= 0) {
          throw new GuiaNotFoundException(guia.idGuiaCourier);
        }

        const resultado = await this.oracleService.marcarGuiaCourier({
          motivoMarca: marcarDto.motivoMarca,
          idGuiaCourier: guia.idGuiaCourier,
          numeroDocumento: guia.numeroDocumento,
          codigoTipoDocumento: guia.codigoTipoDocumento,
          tipoDocumento: guia.tipoDocumento,
          idPersona: marcarDto.idPersona,
          observacion: marcarDto.observacion,
          tipoFiscalizacion: marcarDto.tipoFiscalizacion,
          descripcion: marcarDto.descripcion,
          propuesta: marcarDto.propuesta
        });

        resultados.push({
          idGuia: guia.idGuiaCourier,
          numeroDocumento: guia.numeroDocumento,
          resultado: resultado.resultado,
          success: resultado.success
        });

        if (resultado.success) {
          guiasMarcadas++;
        } else {
          guiasConError++;
        }

      } catch (error) {
        this.logger.error(`Error marcando guía ${guia.idGuiaCourier}:`, error);
        resultados.push({
          idGuia: guia.idGuiaCourier,
          numeroDocumento: guia.numeroDocumento,
          resultado: error.message,
          success: false
        });
        guiasConError++;
      }
    }

    return {
      success: guiasConError === 0,
      message: guiasConError === 0 ? 'Guías marcadas exitosamente' : `${guiasMarcadas} guías marcadas, ${guiasConError} con error`,
      totalGuias: marcarDto.guias.length,
      guiasMarcadas,
      guiasConError,
      motivoMarca: marcarDto.motivoMarca,
      timestamp: new Date().toISOString(),
      resultados
    };
  }
}
