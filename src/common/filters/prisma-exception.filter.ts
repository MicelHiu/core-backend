import {
    ArgumentsHost,
    Catch,
    ConflictException,
    ExceptionFilter,
    HttpException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();

        let httpException: HttpException;
        switch(exception.code) {
            case 'P2025': //rec yang mau diupdate/del tidak ditemukan
                httpException = new NotFoundException('Resource not found');
                break;
            case 'P2002': //pelanggaran unique constraint
                httpException = new ConflictException(
                    `Conflict: ${(exception.meta?.target as string[])?.join(', ') ?? 'duplicate value'}`,
                    );
                break;
            default: 
                httpException = new InternalServerErrorException('Unexpected database error');
        }

        const status = httpException.getStatus();
        const body = httpException.getResponse();
        response.status(status).json(
            typeof body === 'string' ? { statusCode: status, message: body } : body,
        );
    }
}