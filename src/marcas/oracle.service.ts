import { Injectable, Logger } from '@nestjs/common';
import * as oracledb from 'oracledb';
import { 
  ManifiestoNotFoundException, 
  GuiaNotFoundException, 
  DatabaseConnectionException,
  InvalidManifiestoFormatException,
  InvalidGuiaFormatException 
} from '../common/exceptions/business.exception';
import { MarcarGuiaDto } from './dto/marcar-guia.dto';
import { MarcarGuiaResponseDto } from './dto/marcar-guia-response.dto';

@Injectable()
export class OracleService {
    private readonly logger = new Logger(OracleService.name);
    private oracleInitialized = false;

    constructor() {
        this.initializeOracle();
    }

    private initializeOracle() {
        if (this.oracleInitialized) return;

        try {
            const oracleHome = process.env.ORACLE_HOME;
            if (!oracleHome) {
                throw new Error('ORACLE_HOME environment variable is not set');
            }

            this.logger.log('🔧 Configuring Oracle environment variables');
            this.logger.log(`  ORACLE_HOME: ${oracleHome}`);

            oracledb.initOracleClient({
                libDir: oracleHome,
                configDir: oracleHome
            });
            this.oracleInitialized = true;
            this.logger.log('✅ Oracle client initialized');
        } catch (error) {
            this.logger.error('❌ Failed to initialize Oracle client:', error.message);
            throw new Error(`Oracle initialization failed: ${error.message}`);
        }
    }

    private async getConnection(): Promise<oracledb.Connection> {
        if (!this.oracleInitialized) {
            this.initializeOracle();
        }

        const dbUsername = process.env.DB_USERNAME;
        const dbPassword = process.env.DB_PASSWORD;
        const dbHost = process.env.DB_HOST;
        const dbPort = process.env.DB_PORT || '1521';
        const dbName = process.env.DB_NAME;

        if (!dbUsername || !dbPassword || !dbHost || !dbName) {
            throw new DatabaseConnectionException('Missing required database environment variables');
        }

        try {
            const connection = await oracledb.getConnection({
                user: dbUsername,
                password: dbPassword,
                connectString: `${dbHost}:${dbPort}/${dbName}`
            });

            this.logger.log('✅ Successfully connected to Oracle database');
            return connection;
        } catch (error) {
            this.logger.error('❌ Failed to connect to Oracle database:', error.message);
            throw new DatabaseConnectionException(error.message);
        }
    }

    async consultarGuiasConMarcas(
        idManifiesto: number,
        tipoAccion?: string,
        guiaCourier?: string
    ) {
        const connection = await this.getConnection();
        try {
            this.logger.log(`🔍 Consultando guías con marcas para manifiesto: ${idManifiesto}`);

            const query = `
        SELECT r.docorigen AS docorigen,
               docbase.numeroexterno AS numerodoc,
               docbase.emisor AS nombreemisor,
               docbase.totalbultos,
               docbase.totalpeso,
               docbase.valordeclarado,
               (SELECT nombreparticipante FROM docparticipacion WHERE documento = docbase.id AND rol = 'CNTE') consignante,
               (SELECT nombreparticipante FROM docparticipacion WHERE documento = docbase.id AND rol = 'CONS') consignatario,
               (SELECT NUMEROID FROM docparticipacion WHERE documento = docbase.id AND rol = 'CONS') rutconsignatario,
               courier_consultas.gtime_getmarcasasstring(docbase.id) marcas,
               courier_consultas.gtime_geMotivoSeleccion(docbase.id) motivoseleccion
        FROM documentos.docdocumentobase docbase
        LEFT JOIN documentos.docrelaciondocumento r ON r.docdestino = :idManifiesto AND r.tiporelacion = 'REF'
        WHERE docbase.id = r.docorigen
          AND docbase.tipodocumento = 'GTIME'
          AND docbase.activo = 'S'
          AND EXISTS (
            SELECT 1 FROM docestados est
            WHERE docbase.tipodocumento = est.tipodocumento
              AND docbase.id = est.documento
              AND est.tipoestado = 'CON MARCA'
              AND est.activa = 'S'
          )
          AND NOT EXISTS (
            SELECT 1 FROM docestados de
            WHERE de.documento = docbase.id
              AND de.tipoestado = 'ANU'
              AND de.activa = 'S'
          )
        ORDER BY rutconsignatario
      `;

            const result = await connection.execute(query, { idManifiesto });
            const processedRows = [];

            for (const row of result.rows) {
                const rowData = {};
                result.metaData.forEach((col, index) => {
                    rowData[col.name] = row[index];
                });
                processedRows.push(rowData);
            }

            this.logger.log(`✅ Consulta exitosa: ${processedRows.length} guías encontradas`);
            return processedRows;

        } catch (error) {
            this.logger.error('❌ Error en consultarGuiasConMarcas:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async obtenerIdManifiestoPorNumero(numeroManifiesto: string): Promise<number> {
        // Validar formato del número de manifiesto
        if (!/^\d+$/.test(numeroManifiesto)) {
            throw new InvalidManifiestoFormatException(numeroManifiesto);
        }

        const connection = await this.getConnection();
        try {
            this.logger.log(`🔍 Obteniendo ID de manifiesto para número: ${numeroManifiesto}`);

            const query = `
                SELECT id 
                FROM documentos.DOCDOCUMENTOBASE 
                WHERE tipodocumento = 'MFTOC' 
                  AND activo = 'S' 
                  AND numeroexterno = :numeroManifiesto
            `;

            const result = await connection.execute(query, {
                numeroManifiesto: numeroManifiesto
            });

            if (result.rows && result.rows.length > 0) {
                const idManifiesto = Number(result.rows[0][0]);
                this.logger.log(`✅ ID de manifiesto encontrado: ${idManifiesto}`);
                return idManifiesto;
            }

            this.logger.log(`❌ No se encontró manifiesto con número: ${numeroManifiesto}`);
            throw new ManifiestoNotFoundException(numeroManifiesto);

        } catch (error) {
            if (error instanceof ManifiestoNotFoundException || error instanceof InvalidManifiestoFormatException) {
                throw error;
            }
            this.logger.error('❌ Error obteniendo ID de manifiesto:', error);
            throw new DatabaseConnectionException(error.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async consultarGuiasCourier(numeroManifiesto: string, guiaCourier?: string) {
        // Validar formato de guía courier si se proporciona
        if (guiaCourier && !/^[A-Z0-9]+$/.test(guiaCourier)) {
            throw new InvalidGuiaFormatException(guiaCourier);
        }

        let connection;
        try {
            this.logger.log(`🔍 Consultando guías courier para manifiesto: ${numeroManifiesto}`);

            // Primero obtener el ID del manifiesto
            const idManifiesto = await this.obtenerIdManifiestoPorNumero(numeroManifiesto);
            this.logger.log(`✅ ID de manifiesto obtenido: ${idManifiesto}`);

            // Ahora consultar las guías usando el ID del manifiesto
            connection = await this.getConnection();
            
            const query = `
                SELECT r.tiporelacion AS tiporelacion,
                       r.docorigen AS docorigen,
                       r.id AS id,
                       r.observacion AS observacion,
                       r.fecha AS fecharelacion,
                       docbase.tipodocumento AS tipodocumento,
                       docbase.numeroexterno AS numerodoc,
                       docbase.idemisor AS emisor,
                       docbase.emisor AS nombreemisor,
                       docbase.fechaemision AS fechaemision,
                       docbase.id AS iddocdestino,
                       docbase.fechacreacion AS fechaactiva,
                       docbase.version AS version,
                       (SELECT sentido
                          FROM doctrandoctransporte dt
                         WHERE dt.id = docbase.id) sentidooperacion,
                       DECODE((SELECT tipoestado
                                FROM docestados est
                               WHERE docbase.tipodocumento = est.tipodocumento
                                 AND docbase.id = est.documento
                                 AND est.tipoestado = 'VIS'
                                 AND est.activa = 'S'
                                 AND ROWNUM = 1),
                              NULL,
                              'NO',
                              'SI') esrevisado,
                       DECODE((SELECT tipoestado
                                FROM docestados est
                               WHERE docbase.tipodocumento = est.tipodocumento
                                 AND docbase.id = est.documento
                                 AND est.tipoestado = 'CON MARCA'
                                 AND est.activa = 'S'
                                 AND ROWNUM = 1),
                              NULL,
                              'NO',
                              'SI') esmarcado,
                       (SELECT nombreparticipante
                          FROM docparticipacion
                         WHERE documento = docbase.id
                           AND rol = 'CNTE') consignante,
                       (SELECT NUMEROID
                          FROM docparticipacion
                         WHERE documento = docbase.id
                           AND rol = 'CONS') RUTconsignatario,
                       (SELECT nombreparticipante
                          FROM docparticipacion
                         WHERE documento = docbase.id
                           AND rol = 'CONS') consignatario,
                       courier_consultas.gtime_getproductosasstring(docbase.id) productos,
                       courier_consultas.gtime_getmarcasasstring(docbase.id) marcas,
                       courier_consultas.gtime_getvistosbuenos(docbase.id) vistosbuenos,
                       courier_consultas.gtime_gettransbordos(docbase.id) transbordos,
                       courier_consultas.gtime_getestado(docbase.id) estadoactual,
                       courier_consultas.gtime_geMotivoSeleccion(docbase.id) motivoseleccion,
                       dtran.totalbultos,
                       dtran.totalpeso,
                       dtran.valordeclarado
                  FROM documentos.docdocumentobase docbase
                  left join doctransporte.doctrandoctransporte dtran
                    on docbase.id = dtran.id
                  left join documentos.docrelaciondocumento r
                    on r.docdestino = :idManifiesto
                   and r.tiporelacion = 'REF'
                   AND r.activo = 'S'
                 WHERE docbase.id = r.docorigen
                   AND docbase.tipodocumento = 'GTIME'
                   AND docbase.activo = 'S'
                   AND docbase.id NOT IN (SELECT documento
                                          FROM docestados de
                                         WHERE de.documento = docbase.id
                                           AND de.tipoestado = 'ANU'
                                           AND de.activa = 'S')
                 order by rutconsignatario
            `;

            const result = await connection.execute(query, { idManifiesto: idManifiesto });
            let guias = result.rows || [];
            
            if (guiaCourier && guiaCourier.trim()) {
                guias = guias.filter(guia => 
                    guia[6] && guia[6].toString().toUpperCase() === guiaCourier.toUpperCase()
                );
            }

            const processedGuias = guias.map(guia => ({
                Oid: { Id: guia[1] },
                NumeroDoc: guia[6] || '',
                NombreEmisor: guia[8] || '',
                TotalBultos: guia[25] || 0,
                TotalPeso: guia[26] || 0,
                TotalValor: guia[27] || 0,
                Consignante: guia[20] || '',
                Consignatario: guia[22] || '',
                Numero: guia[6] || '',
                TipoDoc: 'GUIA TIME',
                CodigoTipoDoc: guia[5] || '',
                EstadoActual: guia[24] || '',
                Productos: guia[21] || '',
                Transbordos: guia[23] || '',
                VistosBuenos: guia[22] || '',
                FechaCreacion: guia[10] || '',
                rutconsignatario: guia[21] || '',
                MotivoSeleccion: guia[25] || '',
                Detalle: 'Más Info.',
                Transito: guia[13] === 'TR' ? 'SI' : 'NO',
                verPDF: `<img src="/WebFiscalizaciones/resources/images/crobat3.jpg" style="cursor:pointer;" width="20" height="20" onclick="javascript:getPDF('${guia[1]}','1','GTIME');" >`
            }));

            this.logger.log(`✅ Consulta exitosa: ${processedGuias.length} guías encontradas`);
            return {
                guias: processedGuias,
                rowsCount: processedGuias.length
            };

        } catch (error) {
            if (error instanceof ManifiestoNotFoundException || 
                error instanceof InvalidManifiestoFormatException ||
                error instanceof InvalidGuiaFormatException) {
                throw error;
            }
            this.logger.error('❌ Error en consultarGuiasCourier:', error);
            throw new DatabaseConnectionException(error.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async modificarMarcaGuia(
        idGuia: number,
        motivoMarca: string,
        observacion?: string
    ) {
        const connection = await this.getConnection();
        try {
            this.logger.log(`🔧 Modificando marca para guía: ${idGuia}`);

            return {
                success: true,
                message: `Marca modificada para guía ${idGuia}`,
                motivoMarca,
                observacion
            };

        } catch (error) {
            this.logger.error('❌ Error en modificarMarcaGuia:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

  async marcarGuiaCourier(marcarDto: any): Promise<any> {
    const connection = await this.getConnection();
    try {
      this.logger.log(`🔧 Marcando guía: ${marcarDto.numeroDocumento}`);

      const query = `{ call DOCUMENTOS.COURIER_CONSULTAS.fset_marcarGuiaCourier(?,?,?,?,?,?,?,?,?,?,?) }`;
      
      const result = await connection.execute(query, {
        motivoMarca: marcarDto.motivoMarca,
        idGuiaCourier: marcarDto.idGuiaCourier,
        numeroDocumento: marcarDto.numeroDocumento,
        codigoTipoDocumento: marcarDto.codigoTipoDocumento,
        tipoDocumento: marcarDto.tipoDocumento,
        idPersona: parseInt(marcarDto.idPersona),
        observacion: marcarDto.observacion,
        respuesta: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        tipoFiscalizacion: marcarDto.tipoFiscalizacion || null,
        descripcion: marcarDto.descripcion || null,
        propuesta: null
      });

      const resultado = result.outBinds.respuesta;
      const success = resultado === 'BIEN';

      this.logger.log(`✅ Resultado marcado: ${resultado}`);

      return {
        success,
        message: success ? 'Guía marcada exitosamente' : resultado,
        resultado,
        idGuia: marcarDto.idGuiaCourier,
        motivoMarca: marcarDto.motivoMarca,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('❌ Error marcando guía:', error);
      throw new DatabaseConnectionException(error.message);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async cambiarMarcaCourier(cambiarDto: any): Promise<any> {
    const connection = await this.getConnection();
    try {
      this.logger.log(`🔄 Cambiando marca de guía: ${cambiarDto.numeroDocumento}`);
      this.logger.log(`📝 Motivo descarte: ${cambiarDto.motivoDescarte}`);

      const query = `{ call DOCUMENTOS.COURIER_CONSULTAS.fset_desmarcarGuiaCourier(?,?,?,?,?,?,?,?,?,?,?,?) }`;
      
      const result = await connection.execute(query, {
        motivoMarca: cambiarDto.motivoMarca,
        idGuiaCourier: cambiarDto.idGuiaCourier,
        numeroDocumento: cambiarDto.numeroDocumento,
        codigoTipoDocumento: cambiarDto.codigoTipoDocumento,
        tipoDocumento: cambiarDto.tipoDocumento,
        idPersona: parseInt(cambiarDto.idPersona),
        observacion: cambiarDto.observacion,
        tipoFiscalizacion: cambiarDto.tipoFiscalizacion || null,
        descripcion: cambiarDto.descripcion || null,
        nombrePersona: null,
        motivoDescarte: cambiarDto.motivoDescarte,
        respuesta: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
      });

      const resultado = result.outBinds.respuesta;
      const success = resultado === 'BIEN';

      this.logger.log(`✅ Resultado cambio de marca: ${resultado}`);

      return {
        success,
        message: success 
          ? 'Marca anterior descartada y nueva marca creada exitosamente' 
          : resultado,
        resultado,
        idGuia: cambiarDto.idGuiaCourier,
        motivoMarca: cambiarDto.motivoMarca,
        motivoDescarte: cambiarDto.motivoDescarte,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('❌ Error cambiando marca:', error);
      throw new DatabaseConnectionException(error.message);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}
