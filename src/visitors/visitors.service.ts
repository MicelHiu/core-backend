import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { VisitorsRepository } from './visitors.repository';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { VisitorListQueryDto, VisitorStatsQueryDto } from './dto/visitor-query.dto';

@Injectable()
export class VisitorsService {
    constructor(private readonly visitorsRepository: VisitorsRepository) {}

    private readonly checkInAllowedStatus = ['confirmed', 'ongoing'];

    async checkIn(dto: CreateVisitorDto) {
        const booking = await this.visitorsRepository.getBookingStatus(dto.booking_code);
        if (!booking) throw new NotFoundException('Booking not found');
        if (!this.checkInAllowedStatus.includes(booking.status)) {
            throw new BadRequestException(
                `Cannot check-in a booking with status '${booking.status}`,
            );
        }

        return this.visitorsRepository.createVisitor({
            booking_code: dto.booking_code,
            user_id: booking.user_id,
            guest_name: dto.guest_name,
            checked_in: dto.checked_in ? new Date(dto.checked_in) : new Date(),
        });
    }

    findAll(query: VisitorListQueryDto) {
        const from = query.from ? new Date(query.from) : undefined;
        const to = query.to ? new Date(query.to) : undefined;
        return this.visitorsRepository.findAll(from, to);
    }

    async findById(id: string) {
        const visitor = await this.visitorsRepository.findById(id);
        if (!visitor) throw new NotFoundException('Visitor not found');
        return visitor;
    }

    async getStats(query: VisitorStatsQueryDto) {
        const year = query.year ?? new Date().getFullYear();
        const groupBy = query.groupBy ?? 'month';

        if (groupBy === 'year') {
            const toYear = query.toYear ?? new Date().getFullYear();
            const fromYear = query.fromYear ?? toYear - 4; // default: 5 tahun terakhir

            const from = new Date(Date.UTC(fromYear, 0, 1));
            const to = new Date(Date.UTC(toYear, 11, 31, 23, 59, 59));
            const rows = await this.visitorsRepository.findCheckedInInRange(from, to);

            const yearsCount = toYear - fromYear + 1;
            const counts = Array.from({ length: yearsCount }, () => 0);
            for (const row of rows) {
                const idx = row.checked_in.getUTCFullYear() - fromYear;
                if (idx >= 0 && idx < yearsCount) counts[idx]++;
            }
            return counts.map((count, i) => ({ year: fromYear + i, count }));
        }

        if (groupBy === 'month') {
            const from = new Date(Date.UTC(year, 0, 1));
            const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
            const rows = await this.visitorsRepository.findCheckedInInRange(from, to);

            const counts = Array.from({ length: 12 }, () => 0);
            for (const row of rows) {
                counts[row.checked_in.getUTCMonth()]++;
            }
            return counts.map((count, i) => ({ month: i + 1, count }));
        }

        // groupBy === 'day': butuh month juga, default bulan berjalan
        const month = query.month ?? new Date().getMonth() + 1;
        const from = new Date(Date.UTC(year, month - 1, 1));
        const to = new Date(Date.UTC(year, month, 0, 23, 59, 59));
        const rows = await this.visitorsRepository.findCheckedInInRange(from, to);

        const daysInMonth = to.getUTCDate();
        const counts = Array.from({ length: daysInMonth }, () => 0);
        for (const row of rows) {
            counts[row.checked_in.getUTCDate() - 1]++;
        }
        return counts.map((count, i) => ({
            date: `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
            count,
        }));
    }
}