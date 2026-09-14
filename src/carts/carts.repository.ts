import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCartDto } from "./dto/create-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { Decimal } from "@prisma/client/runtime/index-browser";

@Injectable()
export class CartsRepository {
    constructor(private readonly prisma: PrismaService) {}
    private toTimeDate(time: string): Date {
        return new Date(`1970-01-01T${time}:00.000Z`);
    }

    getAdminCarts(){
        return this.prisma.carts.findMany();
    }

    getAllCarts(userId: string) {
        return this.prisma.carts.findMany({
            where: { user_id: userId }
        });
    }

    getCartById(id: string, userId: string) {
        return this.prisma.carts.findUnique({
            where: {id, user_id: userId},
            include: {
                rooms: {
                    select: {
                        name: true,
                        price: true,
                        type: true,
                        image: true,
                        stock: true,
                    }
                }
            }
        });
    }

    getRoomById(room_id: string) {
        return this.prisma.rooms.findUnique({
            where: {id: room_id},
            select: {
                name: true, 
                price: true, 
                type: true, 
                image: true,
                stock: true
            }
        });
    }

    createCart(dto: Omit<CreateCartDto, 'time_start' | 'time_end'> & {
        user_id: string;
        total_price: Decimal;
        time_start: string;
        time_end: string;
    }) {
        return this.prisma.carts.create({
            data: {
                ...dto,
                time_start: this.toTimeDate(dto.time_start),
                time_end: this.toTimeDate(dto.time_end)
            },
            include: {
                rooms: {
                    select: {
                        name: true,
                        price: true,
                        type: true,
                        image: true,
                        stock: true,
                    }
                }
            }
        });
    }

    updateCart(dto: UpdateCartDto, id: string) {
        return this.prisma.carts.update({
            where: { id },
            data: {
                ...dto,
                ...(dto.time_start && { time_start: this.toTimeDate(dto.time_start) }),
                ...(dto.time_end && { time_end: this.toTimeDate(dto.time_end) }),
            },
            include: {
                rooms: { select: {name: true, stock: true} }
            }
        });
    }

    async deleteCart(id: string, userId: string) {
        const deleted = await this.prisma.carts.delete({
            where: {id, user_id: userId},
        })

        if(!deleted) throw new NotFoundException('Cart not found');
        return {
            deleted,
            message: 'Cart has been deleted',
            status: 203,
            id,
        }
    }
}
