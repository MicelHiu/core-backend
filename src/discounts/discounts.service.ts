import { Injectable, NotFoundException } from '@nestjs/common';
import { DiscountsRepository } from './discounts.repository';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ToggleDiscountDto } from './dto/toggle-discount.dto';

@Injectable()
export class DiscountsService {
    constructor(private readonly discountsRepository: DiscountsRepository){}

    async getAllDiscounts() {
        await this.discountsRepository.deactivateExpiredDiscounts();
        return this.discountsRepository.getAllVisibleDiscounts();
    }

    async getDiscountDetails(id: string) {
        await this.discountsRepository.deactivateExpiredDiscounts();
        const disc = await this.discountsRepository.getVisibleDiscountDetails(id);
        if(!disc) throw new NotFoundException('Discount not found');
        return disc;
    }

    createDiscount(dto: CreateDiscountDto) {
        return this.discountsRepository.createDiscount({
            ...dto,
            is_active: false,
        });
    }

    //admin bisa edit semua, user hanya edit is_active
    async updateDiscount(id: string, dto: UpdateDiscountDto | ToggleDiscountDto, isAdmin: boolean) {
        const existing = await this.discountsRepository.getDiscountDetails(id);
        if(!existing) throw new NotFoundException('Discount not found');

        if(isAdmin) {
            return this.discountsRepository.updateDiscount(dto, id);
        }

        const toggledto: ToggleDiscountDto = {
            is_active: !!dto.is_active
        };
        return this.discountsRepository.updateDiscount(toggledto, id);
    }

    async deleteDiscount(id: string) {
        const existing = await this.discountsRepository.getDiscountDetails(id);
        if(!existing) throw new NotFoundException('Discount not found');
        return this.discountsRepository.deleteDiscount(id);
    }

}
