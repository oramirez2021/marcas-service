import { Module } from '@nestjs/common';
import { MarcasController } from './marcas.controller';
import { MarcasService } from './marcas.service';
import { OracleService } from './oracle.service';

@Module({
    controllers: [MarcasController],
    providers: [MarcasService, OracleService],
    exports: [MarcasService, OracleService],
})
export class MarcasModule { }
