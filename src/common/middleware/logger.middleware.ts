import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logFilePath = path.join(
        process.cwd(),
        'logs',
        'request.log',
    );

    constructor() {
        const logDir = path.dirname(this.logFilePath);
        if(!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();
        const { method, originalUrl } = req;

        res.on('finish', () => {
            const duration = Date.now() - start;
            const logLine = `[${method}] -- ${originalUrl} | ${res.statusCode} | ${duration}ms`;

            console.log(logLine);

            fs.appendFile(this.logFilePath, logLine + '\n', (err) => {
                if(err) {
                    console.error('Failed to write log: ', err);
                }
            });
        });
        next();
    }
}