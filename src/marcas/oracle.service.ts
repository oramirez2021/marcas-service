import { Injectable, Logger } from '@nestjs/common';
import * as oracledb from 'oracledb';

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
            throw new Error('Missing required database environment variables');
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
            throw new Error(`Database connection failed: ${error.message}`);
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

    async modificarMarcaGuia(
        idGuia: number,
        motivoMarca: string,
        observacion?: string
    ) {
        const connection = await this.getConnection();
        try {
            this.logger.log(`🔧 Modificando marca para guía: ${idGuia}`);

            // Aquí implementarías la lógica para modificar la marca
            // Por ahora retornamos un mensaje de confirmación
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
}
