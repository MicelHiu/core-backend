import { PrismaService } from "src/prisma/prisma.service";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DiscountsRepository {
    constructor(private readonly prisma: PrismaService){}
    getAllDiscounts() {
        return this.prisma.discounts.findMany();
    }

    getDiscountDetails(id: string) {
        return this.prisma.discounts.findUnique({where: {id}});
    }

    createDiscount(dto: CreateDiscountDto & { is_active: boolean }) {
        return this.prisma.discounts.create({
            data: {
                ...dto,
                valid_from: new Date(dto.valid_from),
                valid_until: new Date(dto.valid_until),
            },
        });
    }

    updateDiscount(dto: Partial<UpdateDiscountDto>, id: string) {
        return this.prisma.discounts.update({
            where: {id},
            data: {
                ...dto,
                ...(dto.valid_from && { valid_from: new Date(dto.valid_from) }),
                ...(dto.valid_until && { valid_until: new Date(dto.valid_until) }),
            },
        });
    }

    async deleteDiscount(id: string) {
        const deleted = await this.prisma.discounts.delete({where: {id}});
        return {
            deleted,
            message: `Voucher has been deleted`,
            status: 203,
            id,
        }
    }

    // Soft-hide: expired discounts di-nonaktifkan (is_active = false), bukan dihapus,
     // supaya tidak melanggar FK dari carts/bookings yang masih mereferensikan row ini.
    deactivateExpiredDiscounts() {
        return this.prisma.discounts.updateMany({
            where: { valid_until: { lt: new Date() }, is_active: true },
            data: { is_active: false },
        });
    }
    getAllVisibleDiscounts() {
        return this.prisma.discounts.findMany({
            where: { valid_from: { lte: new Date() }, valid_until: { gte: new Date() } },
        });
    }
    getVisibleDiscountDetails(id: string) {
        return this.prisma.discounts.findFirst({
            where: { id, valid_from: { lte: new Date() }, valid_until: { gte: new Date() } },
        });
    }
}