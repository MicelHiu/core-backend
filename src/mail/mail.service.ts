import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly transporter = process.env.SMTP_HOST
        ? nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT ?? 587),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        })
        : null;

    async sendPasswordReset(to: string, name: string, link: string) {
        // tanpa SMTP (local dev), link cukup dicetak di log
        if (!this.transporter) {
            this.logger.warn(`SMTP not configured. Password reset link for ${to}: ${link}`);
            return;
        }

        const safeName = name.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
        await this.transporter.sendMail({
            from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
            to,
            subject: 'Reset your Core password',
            text: `Hi ${name},\n\nUse this link to reset your password (valid for 15 minutes):\n${link}\n\nIf you didn't request this, you can ignore this email.`,
            html: `<p>Hi ${safeName},</p><p>Use this link to reset your password (valid for 15 minutes):</p><p><a href="${link}">Reset password</a></p><p>If you didn't request this, you can ignore this email.</p>`,
        });
    }
}
