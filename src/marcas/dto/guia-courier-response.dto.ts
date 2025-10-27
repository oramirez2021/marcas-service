import { ApiProperty } from '@nestjs/swagger';

class OidDto {
  @ApiProperty({ example: 5157422 })
  Id: number;
}

export class GuiaCourierResponseDto {
  @ApiProperty({ type: OidDto })
  Oid: OidDto;

  @ApiProperty({ example: '843712644220' })
  NumeroDoc: string;

  @ApiProperty({ example: 'FEDERAL EXPRESS' })
  NombreEmisor: string;

  @ApiProperty({ example: 1 })
  TotalBultos: number;

  @ApiProperty({ example: 17 })
  TotalPeso: number;

  @ApiProperty({ example: 36.92 })
  TotalValor: number;

  @ApiProperty({ example: '843712644220' })
  Consignante: string;

  @ApiProperty({ example: '' })
  Consignatario: string;

  @ApiProperty({ example: '843712644220' })
  Numero: string;

  @ApiProperty({ example: 'GUIA TIME' })
  TipoDoc: string;

  @ApiProperty({ example: 'GTIME' })
  CodigoTipoDoc: string;

  @ApiProperty({ example: '<br>D-DECLARACION' })
  EstadoActual: string;

  @ApiProperty({ example: '' })
  Productos: string;

  @ApiProperty({ example: '' })
  Transbordos: string;

  @ApiProperty({ example: '' })
  VistosBuenos: string;

  @ApiProperty({ example: 5157423 })
  FechaCreacion: number;

  @ApiProperty({ example: '' })
  rutconsignatario: string;

  @ApiProperty({ example: 1 })
  MotivoSeleccion: number;

  @ApiProperty({ example: 'Más Info.' })
  Detalle: string;

  @ApiProperty({ example: 'NO' })
  Transito: string;

  @ApiProperty({ example: '<img src="/WebFiscalizaciones/resources/images/crobat3.jpg" style="cursor:pointer;" width="20" height="20" onclick="javascript:getPDF(\'5157423\',\'1\',\'GTIME\');" >' })
  verPDF: string;
}
