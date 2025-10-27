import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as serverless from 'serverless-http';

let cachedServer: any;

async function createServer() {
    if (!cachedServer) {
        const expressApp = express();
        const adapter = new ExpressAdapter(expressApp);

        const app = await NestFactory.create(AppModule, adapter);

        // Configuración para Lambda
        app.enableCors({
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true,
        });

        // Health check para Lambda
        app.getHttpAdapter().get('/api/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'production'
            });
        });

        await app.init();
        cachedServer = serverless(expressApp);
    }
    return cachedServer;
}

export const handler = async (event: any, context: any) => {
    const server = await createServer();
    return server(event, context);
};
