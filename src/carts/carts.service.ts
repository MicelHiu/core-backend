import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CartsRepository } from './carts.repository';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Decimal } from '@prisma/client/runtime/index-browser';
import { DiscountsRepository } from 'src/discounts/discounts.repository';

@Injectable()
export class CartsService {
    constructor(
        private readonly cartsRepository: CartsRepository,
        private readonly discountsRepository: DiscountsRepository,
    ) {}
    private formatTime(date: Date): string {
        return date.toISOString().substring(11, 19);
    }
    private mapCart(cart: any) {
        return {
            ...cart,
            time_start: this.formatTime(cart.time_start),
            time_end: this.formatTime(cart.time_end)
        };
    }

    getAdminCarts() {
        return this.cartsRepository.getAdminCarts();
    }
    
    async getAllCarts(userId: string) {
        const data = await this.cartsRepository.getAllCarts(userId);
        return data.map(cart => this.mapCart(cart));
    }

    async getCartById(id: string, userId: string) {
        const data = await this.cartsRepository.getCartById(id, userId);
        if(!data) throw new NotFoundException('Cart not found');
        return this.mapCart(data);
    }

    private calculateDurationHours(time_start:string, time_end:string): number {
        const [startH, startM] = time_start.split(':').map(Number);
        const [endH, endM] = time_end.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const durationMinutes = endMinutes - startMinutes;
        if (durationMinutes < 0) throw new BadRequestException('time_end must be after time_start');
        return durationMinutes / 60;
    }
    private calculateTotalPrice(
        roomPrice: Decimal,
        durationHours: number,
        quantity: number,
        discountValue?: Decimal,
    ): Decimal {
        let total = roomPrice.mul(durationHours).mul(quantity);
        if(discountValue) {
            total = total.sub(discountValue);
        }
        return total;
    }

     // Validasi discount_id ke tabel discounts: harus ada, aktif, dan belum expired.
    // discount_value TIDAK boleh dipercaya dari client — dihitung ulang di server.
    private async resolveDiscountValue(discountId?: string): Promise<Decimal | undefined> {
        if (!discountId) return undefined;

        const discount = await this.discountsRepository.getVisibleDiscountDetails(discountId);
        if (!discount) throw new NotFoundException('Discount not found or expired');
        if (!discount.is_active) throw new BadRequestException('Discount is not active');

        return discount.value;
    }

    async createCart(dto: CreateCartDto, userId: string) {
        const roomId = dto.room_id;
        if (!roomId) throw new NotFoundException('Room not found');

        const room = await this.cartsRepository.getRoomById(roomId);
        if(!room) throw new NotFoundException('Room not found');
        if(room.stock < 1) throw new NotFoundException('Room is out of stock');

        const discountValue = await this.resolveDiscountValue(dto.discount_id);
        
        const durationHours = this.calculateDurationHours(dto.time_start, dto.time_end);
        const totalPrice = this.calculateTotalPrice(room.price, durationHours, dto.quantity, discountValue);

        const cart = await this.cartsRepository.createCart({
            ...dto,
            discount_value: discountValue,
            total_price: totalPrice,
            user_id: userId,
        });
        return this.mapCart(cart);
    }

    async updateCart(dto: UpdateCartDto, id: string, userId: string) {
        const oldCart = await this.cartsRepository.getCartById(id, userId);
        if(!oldCart) throw new NotFoundException('Cart not found');

        let room: Awaited<ReturnType<CartsRepository['getRoomById']>> | null = oldCart.rooms ?? null;
        if(dto.room_id) {
            room = await this.cartsRepository.getRoomById(dto.room_id);
            if(!room) throw new NotFoundException('Room not found');
        }

        if(room && room.stock < 1) throw new NotFoundException('Room is out of stock');

        const timeStart = dto.time_start ?? this.formatTime(oldCart.time_start);
        const timeEnd = dto.time_end ?? this.formatTime(oldCart.time_end);
        const quantity = dto.quantity ?? oldCart.quantity;
        // discount_id tidak dikirim (undefined) -> pakai discount_value lama dari cart (kalau ada).
        // discount_id dikirim string -> revalidasi ke tabel discounts.
        // discount_id dikirim null -> user melepas promo, hapus discount_value.
        const discountValue = dto.discount_id === undefined
            ? (oldCart.discount_value ?? undefined)
            : dto.discount_id
                ? await this.resolveDiscountValue(dto.discount_id)
                : undefined;

        const durationHours = this.calculateDurationHours(timeStart, timeEnd);
        const totalPrice = room ? this.calculateTotalPrice(room.price, durationHours, quantity, discountValue) : oldCart.total_price;

        const cart = await this.cartsRepository.updateCart(
            {...dto, discount_value: discountValue, total_price: totalPrice},
            id,
        );
        return this.mapCart(cart);
    }

    async deleteCart(id: string, userId: string) {
        const cart = await this.cartsRepository.getCartById(id, userId);
        if(!cart) throw new NotFoundException('Cart not found');

        return this.cartsRepository.deleteCart(id, userId);
    }
}
