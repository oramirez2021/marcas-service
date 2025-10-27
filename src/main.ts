import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as oracledb from 'oracledb';

async function bootstrap() {
    // Inicializar Oracle en modo thick ANTES de crear la app
    try {
        const oracleHome = process.env.ORACLE_HOME;
        if (oracleHome) {
            oracledb.initOracleClient({
                libDir: oracleHome,
                configDir: oracleHome
            });
            console.log('🔧 Oracle client initialized in THICK mode');
        }
    } catch (error) {
        console.warn('⚠️ Oracle client initialization warning:', error.message);
    }
    const app = await NestFactory.create(AppModule);

    // Configuración de CORS
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: true,
    });

    // Configuración de validación global
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            exceptionFactory: (errors) => {
                const result = errors.map((error) => ({
                    property: error.property,
                    value: error.value,
                    constraints: error.constraints,
                }));
                return new Error(JSON.stringify(result));
            },
        }),
    );

    // Filtro global de excepciones
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Interceptor global de logging
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Configuración de Swagger
    const config = new DocumentBuilder()
        .setTitle('Marcas Service API')
        .setDescription('API para gestión de marcas de fiscalización')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Health check endpoint
    app.getHttpAdapter().get('/api/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Marcas Service running on port ${port}`);
}

bootstrap();
