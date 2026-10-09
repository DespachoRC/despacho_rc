import 'server-only';
import nodemailer from 'nodemailer';

export interface EmailRecipient {
    email: string;
    name: string;
}

export interface TransactionalEmail {
    to: EmailRecipient;
    subject: string;
    title: string;
    message: string;
    actionUrl?: string;
}

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function buildEmailContent(email: TransactionalEmail) {
    const title = escapeHtml(email.title);
    const message = escapeHtml(email.message);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    const actionLink = siteUrl && email.actionUrl
        ? `<p style="margin:24px 0 0"><a href="${escapeHtml(new URL(email.actionUrl, `${siteUrl}/`).toString())}" style="display:inline-block;padding:11px 18px;background:#071a52;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Abrir DespachoRC</a></p>`
        : '';

    return {
        htmlContent: `
            <div style="margin:0;padding:32px 16px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a">
                <div style="max-width:560px;margin:0 auto;padding:28px;background:#fff;border:1px solid #e2e8f0;border-radius:16px">
                    <p style="margin:0 0 18px;color:#1e3a8a;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">ER-CONSULTORES</p>
                    <h1 style="margin:0 0 12px;font-size:20px;line-height:1.35">${title}</h1>
                    <p style="margin:0;color:#475569;font-size:14px;line-height:1.6">${message}</p>
                    ${actionLink}
                </div>
            </div>
        `,
        textContent: `${email.title}\n\n${email.message}${siteUrl && email.actionUrl ? `\n\nAbrir DespachoRC: ${new URL(email.actionUrl, `${siteUrl}/`).toString()}` : ''}`,
    };
}

export class EmailService {
    static async sendTransactionalEmail(email: TransactionalEmail): Promise<void> {
        const host = process.env.SMTP_HOST;
        const portValue = process.env.SMTP_PORT;
        const user = process.env.SMTP_USER;
        const password = process.env.SMTP_PASS;
        const senderEmail = process.env.SMTP_FROM_EMAIL;
        const senderName = process.env.SMTP_FROM_NAME || 'ER-CONSULTORES';

        if (!host) throw new Error('Falta configurar SMTP_HOST');
        if (!portValue) throw new Error('Falta configurar SMTP_PORT');
        const port = Number(portValue);
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            throw new Error('SMTP_PORT debe ser un puerto válido');
        }
        if (!user) throw new Error('Falta configurar SMTP_USER');
        if (!password) throw new Error('Falta configurar SMTP_PASS');
        if (!senderEmail) throw new Error('Falta configurar SMTP_FROM_EMAIL con un remitente verificado en Brevo');

        const { htmlContent, textContent } = buildEmailContent(email);
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            requireTLS: port !== 465,
            auth: { user, pass: password },
        });
        await transporter.sendMail({
            from: { name: senderName, address: senderEmail },
            to: { name: email.to.name, address: email.to.email },
            subject: email.subject,
            html: htmlContent,
            text: textContent,
        });
    }
}
