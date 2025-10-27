import { ApiProperty } from '@nestjs/swagger';
import { GuiaCourierResponseDto } from './guia-courier-response.dto';

export class GuiasCourierResponseDto {
    @ApiProperty({ 
        description: 'Lista de guías courier',
        type: [GuiaCourierResponseDto]
    })
    guias: GuiaCourierResponseDto[];

    @ApiProperty({ 
        description: 'Número total de registros devueltos',
        example: 25
    })
    rowsCount: number;
}
