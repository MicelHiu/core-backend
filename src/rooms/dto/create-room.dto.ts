import { IsDecimal, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Decimal } from "generated/prisma/internal/prismaNamespace";

export class CreateRoomDto {
    @IsNotEmpty()
    @IsString()
    id!:string;

    @IsNotEmpty()
    @IsString()
    name!:string;

    @IsNotEmpty()
    @IsString()
    description!:string;

    @IsNotEmpty()
    @IsDecimal()
    price!:Decimal;

    @IsNotEmpty()
    @IsString()
    image!: string;

    @IsNotEmpty()
    @IsString()
    category!:string;

    @IsNotEmpty()
    @IsNumber()
    quantity!:number;
}
