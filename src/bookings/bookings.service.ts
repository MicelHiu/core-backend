import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingRepository } from './bookings.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CartsRepository } from 'src/carts/carts.repository';
import { RoomsRepository } from 'src/rooms/rooms.repository';
import { Decimal } from '@prisma/client/runtime/index-browser';
import { booking_status } from 'generated/prisma/enums';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { identity } from 'rxjs';
import { DiscountsRepository } from 'src/discounts/discounts.repository';
import { VisitorsService } from 'src/visitors/visitors.service';
import { ActivityLogsRepository } from 'src/activity-logs/activity-logs.repository';

@Injectable()
export class BookingsService {
    constructor(
        private readonly bookingsRepository: BookingRepository,
        private readonly cartsRepository: CartsRepository,
        private readonly roomsRepository: RoomsRepository,
        private readonly discountsRepository: DiscountsRepository,
        private readonly visitorsService: VisitorsService,
        private readonly activityLogsRepository: ActivityLogsRepository,
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
        return this.mapBooking(booking);
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

        // 2. Kalau cart pakai diskon, re-validasi lagi ke tabel discounts —
        // diskon bisa saja sudah dimatikan/expired sejak cart dibuat sampai checkout.
        if (cart.discount_id) {
            const discount = await this.discountsRepository.getDiscountDetails(cart.discount_id);
            const now = new Date();
            const isStillValid =
                !!discount &&
                discount.is_active &&
                discount.valid_from <= now &&
                discount.valid_until >= now;

            if (!isStillValid) {
                throw new BadRequestException(
                    'Discount applied to this cart is no longer active or has expired. Please update your cart.',
                );
            }
        }

        // 2.5. Cek sisa stok room untuk tanggal yang dipilih
        const room = await this.roomsRepository.getRoomById(cart.room_id);
        if (!room) throw new NotFoundException('Room not found');

        const bookedQty = await this.roomsRepository.getBookedQuantity(
            cart.room_id,
            cart.date_play,
            this.formatTime(cart.time_start),
            this.formatTime(cart.time_end),
        );
        if (bookedQty + cart.quantity > room.stock) {
            throw new BadRequestException('Room is fully booked for the selected date');
        }

        // 3. Generate kode booking unik
        const code = this.generateBookingCode();

        // 4. Buat booking dari data cart + guest info dari popup
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

        if (existing.status === 'confirmed' && dto.status === 'ongoing') {
            await this.visitorsService.autoCheckIn({
                code: existing.code,
                user_id: existing.user_id,
                guest_name: existing.guest_name,
            });
        }

        if (dto.status && dto.status !== existing.status) {
            await this.activityLogsRepository.create({
                booking_code: code,
                admin_id: userId,
                status: dto.status,
                note: dto.note,
            });
        }

        return this.mapBooking(updated);
    }

    // Customer hanya boleh cancel booking miliknya sendiri yang masih 'confirmed'
    async cancelBooking(userId: string, code: string) {
        const existing = await this.bookingsRepository.getBookingDetails(code, userId);
        if (!existing) throw new NotFoundException('Booking not found');
        if (existing.status !== 'confirmed') {
            throw new BadRequestException(`Only confirmed bookings can be canceled (current status: '${existing.status}')`);
        }

        const updated = await this.bookingsRepository.updateBooking(code, { status: 'canceled' });
        await this.activityLogsRepository.create({
            booking_code: code,
            admin_id: userId,
            status: 'canceled',
            note: 'Canceled by customer',
        });
        return this.mapBooking(updated);
    }

    async getActivityLogs(code: string) {
        const booking = await this.bookingsRepository.getAllBookingDetails(code);
        if (!booking) throw new NotFoundException('Booking not found');
        return this.activityLogsRepository.findByBookingCode(code);
    }
}
