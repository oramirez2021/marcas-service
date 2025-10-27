import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    code?: string,
    details?: any
  ) {
    super(
      {
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode
    );
  }
}

export class ManifiestoNotFoundException extends BusinessException {
  constructor(manifiesto: string) {
    super(
      `No se encontró manifiesto con número: ${manifiesto}`,
      HttpStatus.NOT_FOUND,
      'MANIFIESTO_NOT_FOUND',
      { manifiesto }
    );
  }
}

export class GuiaNotFoundException extends BusinessException {
  constructor(idGuia: number) {
    super(
      `No se encontró guía con ID: ${idGuia}`,
      HttpStatus.NOT_FOUND,
      'GUIA_NOT_FOUND',
      { idGuia }
    );
  }
}

export class DatabaseConnectionException extends BusinessException {
  constructor(originalError?: string) {
    super(
      'Error de conexión a la base de datos',
      HttpStatus.SERVICE_UNAVAILABLE,
      'DATABASE_CONNECTION_ERROR',
      { originalError }
    );
  }
}

export class InvalidManifiestoFormatException extends BusinessException {
  constructor(manifiesto: string) {
    super(
      `Formato de manifiesto inválido: ${manifiesto}. Debe contener solo números.`,
      HttpStatus.BAD_REQUEST,
      'INVALID_MANIFIESTO_FORMAT',
      { manifiesto }
    );
  }
}

export class InvalidGuiaFormatException extends BusinessException {
  constructor(guia: string) {
    super(
      `Formato de guía courier inválido: ${guia}. Debe contener solo letras y números.`,
      HttpStatus.BAD_REQUEST,
      'INVALID_GUIA_FORMAT',
      { guia }
    );
  }
}

export class InvalidMotivoMarcaException extends BusinessException {
  constructor(motivo: string) {
    super(
      `Motivo de marca inválido: ${motivo}. Valores permitidos: F, D, E, G, O, R, SEREMI, ISP, DGMN, SERNAPESCA, DF, PARTIDA`,
      HttpStatus.BAD_REQUEST,
      'INVALID_MOTIVO_MARCA',
      { motivo, validValues: ['F', 'D', 'E', 'G', 'O', 'R', 'SEREMI', 'ISP', 'DGMN', 'SERNAPESCA', 'DF', 'PARTIDA'] }
    );
  }
}
