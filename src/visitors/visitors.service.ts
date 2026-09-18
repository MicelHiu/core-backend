import { Injectable, NotFoundException } from '@nestjs/common';
import { VisitorsRepository } from './visitors.repository';
import { VisitorListQueryDto, VisitorStatsQueryDto } from './dto/visitor-query.dto';

@Injectable()
export class VisitorsService {
    constructor(private readonly visitorsRepository: VisitorsRepository) {}

    async autoCheckIn(booking: { code: string; user_id: string; guest_name: string }) {
        const existing = await this.visitorsRepository.findByBookingCode(booking.code);
        if (existing) return existing;

        return this.visitorsRepository.createVisitor({
            booking_code: booking.code,
            user_id: booking.user_id,
            guest_name: booking.guest_name,
            checked_in: new Date(),
        });
    }

    async findAll(query: VisitorListQueryDto) {
        const from = query.from ? new Date(query.from) : undefined;
        const to = query.to ? new Date(query.to) : undefined;
        const bookings = await this.visitorsRepository.findAll(from, to);

        return bookings.map((b) => {
            const visitor = b.visitors[0];
            return {
                id: visitor?.id ?? b.code,
                booking_code: b.code,
                user_id: b.user_id,
                guest_name: b.guest_name,
                checked_in: visitor?.checked_in ?? null,
                created_at: visitor?.created_at ?? b.created_at,
                bookings: { code: b.code, room_id: b.room_id, date_play: b.date_play, status: b.status },
            };
        });
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