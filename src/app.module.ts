import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validationSchema } from './config/validation.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      validationOptions: { allowUnknown: true, abortEarly: true },
    }),
    TypeOrmModule.forRoot({
      type: 'oracle',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 1521,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      serviceName: process.env.DB_NAME,
      synchronize: false,
      logging: true,
      extra: {
        // Forzar modo thick para Oracle 11g
        connectString: `${process.env.DB_HOST}:${process.env.DB_PORT || 1521}/${process.env.DB_NAME}`,
        mode: 1  // 1 = THICK mode, 0 = THIN mode
      }
    }),
  ],
})
export class AppModule {}