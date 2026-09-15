import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';
import { IsDecimal, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Decimal } from 'generated/prisma/internal/prismaNamespace';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
    @ApiProperty({ example: 'room-001' })
    @IsNotEmpty()
    @IsString()
    id!:string;

    @ApiProperty({ example: 'Deluxe Room' })
    @IsNotEmpty()
    @IsString()
    name!:string;

    @ApiProperty({ example: 'A spacious room with sea view' })
    @IsNotEmpty()
    @IsString()
    description!:string;

    @ApiProperty({ example: '500000' })
    @IsNotEmpty()
    @IsDecimal()
    price!:Decimal;

    @ApiProperty({ example: 'https://example.com/room.jpg' })
    @IsNotEmpty()
    @IsString()
    image!: string;

    @ApiProperty({ example: 'deluxe' })
    @IsNotEmpty()
    @IsString()
    category!:string;

    @ApiProperty({ example: 10 })
    @IsNotEmpty()
    @IsNumber()
    quantity!:number;
}
