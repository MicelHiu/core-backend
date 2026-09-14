import { Injectable } from "@nestjs/common";
import { CreateCartDto } from "src/carts/dto/create-cart.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { Decimal } from "@prisma/client/runtime/index-browser";
import { booking_status } from "generated/prisma/enums";
import { CartsRepository } from "src/carts/carts.repository";
import { UpdateBookingDto } from "./dto/update-booking.dto";

@Injectable()
export class BookingRepository {
    constructor(private readonly prisma: PrismaService, private readonly cartsRepository: CartsRepository,) {}
    private toTimeDate(time: string): Date {
        return new Date(`1970-01-01T${time}:00.000Z`);
    }

    getCustomerBookings() {
        return this.prisma.bookings.findMany();
    }

    getAllBookingDetails(code: string) {
        return this.prisma.bookings.findUnique({ where: { code } });
    }

    getAllBookings(userId: string) {
        return this.prisma.bookings.findMany({
            where: { user_id: userId }
        });
    }

    getBookingDetails(code: string, userId: string) {
        return this.prisma.bookings.findUnique({
            where: {code, user_id: userId},
            include: {
                rooms: {
                    select: {name: true}
                }
            }
        })
    }

    createBooking(dto: Omit<CreateBookingDto, 'cart_id'> & {
        code: string;
        user_id: string;
        room_id: string;
        unit_price: Decimal;
        quantity: number;
        total_price: Decimal;
        date_play: Date;
        time_start: string;
        time_end: string;
        discount_id?: string;
        discount_value?: Decimal;
        status?: booking_status;
    }) {
        return this.prisma.bookings.create({
            data: {
                ...dto,
                status: dto.status ?? 'confirmed',
                time_start: this.toTimeDate(dto.time_start),
                time_end: this.toTimeDate(dto.time_end),
            },
            include: {
                rooms: {
                    select: {
                        name: true,
                        price: true,
                        type: true,
                        image: true,
                    }
                }
            }
        });
    }

    getBookingById(code: string) {
        return this.prisma.bookings.findUnique({
            where: { code }
        });
    }

    updateBooking(code: string, data: Partial<{
        guest_name: string;
        guest_contact: string;
        status: booking_status;
    }>) {
        return this.prisma.bookings.update({
            where: { code },
            data,
            include: {
                rooms: {
                    select: {
                        name: true,
                        price: true,
                        type: true,
                        image: true,
                    }
                }
            }
        })
    }
}