import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingRepository } from './bookings.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CartsRepository } from 'src/carts/carts.repository';
import { Decimal } from '@prisma/client/runtime/index-browser';
import { booking_status } from 'generated/prisma/enums';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { identity } from 'rxjs';

@Injectable()
export class BookingsService {
    constructor(
        private readonly bookingsRepository: BookingRepository,
        private readonly cartsRepository: CartsRepository
    ) {}
    private toTimeDate(date: Date): string {
        return date.toISOString().substring(11, 16);
    }

    private formatTime(time: Date | string): string {
        if (time instanceof Date) return this.toTimeDate(time);
        return time.substring(0, 5);
    }

    private mapBooking(booking: any) {
        return {
            ...booking,
            time_start: this.toTimeDate(booking.time_start),
            time_end: this.toTimeDate(booking.time_end),
        };
    }

    private generateBookingCode(): string {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g,''); //YYYYMMDD
        const random = Math.random().toString(36).slice(2,8).toUpperCase(); //6 karakter acak
        return `BK-${today}-${random}`;
    }

    getCustomerBookings() {
        return this.bookingsRepository.getCustomerBookings();
    }

    async getAllBookingDetails(code: string) {
        const booking = await this.bookingsRepository.getAllBookingDetails(code);
        if(!booking) throw new NotFoundException('Booking not found');
        return booking;
    }

    async getAllBookings(userId: string) {
        const data = await this.bookingsRepository.getAllBookings(userId);
        return data.map(booking => this.mapBooking(booking));
    }

    async getBookingDetail(userId: string, id: string) {
        const data = await this.bookingsRepository.getBookingDetails(id, userId);
        if(!data) throw new NotFoundException('Booking not found');
        return this.mapBooking(data);
    }

    async createBooking(userId: string, dto: CreateBookingDto) {
        // 1. Ambil cart yang mau di-checkout, harus punya user ini
        const cart = await this.cartsRepository.getCartById(dto.cart_id, userId );
        if (!cart) throw new NotFoundException('Cart not found');

        // 2. Generate kode booking unik
        const code = this.generateBookingCode();

        // 3. Buat booking dari data cart + guest info dari popup
        const booking = await this.bookingsRepository.createBooking({
            code,
            user_id: userId,
            room_id: cart.room_id,
            guest_name: dto.guest_name,
            guest_contact: dto.guest_contact,
            unit_price: cart.total_price.div(cart.quantity), // harga per unit dari total cart
            quantity: cart.quantity,
            total_price: cart.total_price,
            date_play: cart.date_play,
            time_start: this.formatTime(cart.time_start),
            time_end: this.formatTime(cart.time_end),
            discount_id: cart.discount_id ?? undefined,
            discount_value: cart.discount_value ?? undefined,
            status: 'confirmed',
        });

        // 4. Cart sudah "dipindah" jadi booking → hapus dari cart
        await this.cartsRepository.deleteCart(dto.cart_id, userId);

        return this.mapBooking(booking);
    }

    private readonly validTransactions: Record<booking_status, booking_status[]> = {
        confirmed: ['ongoing', 'canceled'],
        ongoing: ['completed'],
        completed: [],
        canceled: [],
    };

    async updateBooking(userId: string, code: string, dto: UpdateBookingDto) {
        const existing = await this.bookingsRepository.getAllBookingDetails(code);
        if(!existing) throw new NotFoundException('Booking not found');

        if(dto.status && dto.status !== existing.status) {
            const allowedNext = this.validTransactions[existing.status];
            if(!allowedNext.includes(dto.status)) {
                throw new BadRequestException(`Cannot change status from '${existing.status}' to '${dto.status}'`)
            };
        }

        const updated = await this.bookingsRepository.updateBooking(code, {
            ...(dto.guest_name && { guest_name: dto.guest_name }),
            ...(dto.guest_contact && { guest_contact: dto.guest_contact }),
            ...(dto.status && { status: dto.status }),
        });

        return this.mapBooking(updated);
    }
}
