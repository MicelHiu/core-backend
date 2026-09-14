import { IsIn, IsInt, IsISO8601, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class VisitorListQueryDto {
    @IsISO8601()
    @IsOptional()
    from?: string;

    @IsISO8601()
    @IsOptional()
    to?: string;
}

export class VisitorStatsQueryDto {
    @IsIn(['day', 'month', 'year'])
    @IsOptional()
    groupBy?: 'day' | 'month' | 'year' = 'month';

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    year?: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    @IsOptional()
    month?: number;

    // Dipakai khusus saat groupBy === 'year', menentukan rentang tahun yang ditampilkan
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    fromYear?: number;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    toYear?: number;
}