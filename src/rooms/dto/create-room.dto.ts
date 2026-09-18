import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, IsUrl, Matches, Min } from "class-validator";
import { rooms_type } from "generated/prisma/enums";

export class CreateRoomDto {
    @ApiProperty({ example: 'pc-vip-01', description: 'Unique slug: lowercase letters, numbers and dashes' })
    @IsString()
    @Matches(/^[a-z0-9-]+$/, { message: 'id may only contain lowercase letters, numbers and dashes' })
    id!: string;

    @ApiProperty({ example: 'VIP PC Room' })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiProperty({ example: 'RTX 4080, 240Hz monitor, private booth' })
    @IsNotEmpty()
    @IsString()
    description!: string;

    @ApiProperty({ example: 25000, description: 'Price per hour (IDR)' })
    @IsNumber()
    @Min(0)
    price!: number;

    @ApiProperty({ example: 'https://example.com/room.jpg' })
    @IsUrl()
    image!: string;

    @ApiProperty({ enum: rooms_type, example: 'PC' })
    @IsEnum(rooms_type)
    type!: rooms_type;

    @ApiProperty({ example: 10, description: 'Number of seats' })
    @IsInt()
    @Min(0)
    stock!: number;
}
