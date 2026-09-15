import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt, IsISO8601, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class VisitorListQueryDto {
    @ApiProperty({ example: '2026-09-01', required: false })
    @IsISO8601()
    @IsOptional()
    from?: string;

    @ApiProperty({ example: '2026-09-30', required: false })
    @IsISO8601()
    @IsOptional()
    to?: string;
}

export class VisitorStatsQueryDto {
    @ApiProperty({ enum: ['day', 'month', 'year'], required: false, default: 'month' })
    @IsIn(['day', 'month', 'year'])
    @IsOptional()
    groupBy?: 'day' | 'month' | 'year' = 'month';

    @ApiProperty({ example: 2026, required: false })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    year?: number;

    @ApiProperty({ example: 9, minimum: 1, maximum: 12, required: false })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    @IsOptional()
    month?: number;

    // Dipakai khusus saat groupBy === 'year', menentukan rentang tahun yang ditampilkan
    @ApiProperty({ example: 2024, required: false })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    fromYear?: number;

    @ApiProperty({ example: 2026, required: false })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    toYear?: number;
}