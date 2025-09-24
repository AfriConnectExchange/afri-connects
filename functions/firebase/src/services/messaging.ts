import sgMail from '@sendgrid/mail';
import Twilio from 'twilio';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

let twilioClient: any = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!SENDGRID_API_KEY) {
    console.log('SENDGRID not configured — email:', { to, subject });
    return;
  }
  const msg = { to, from: process.env.SENDGRID_FROM || 'no-reply@africonnect.local', subject, html };
  await sgMail.send(msg as any);
}

export async function sendSms(to: string, message: string) {
  if (!twilioClient || !TWILIO_FROM) {
    console.log('Twilio not configured — sms:', { to, message });
    return;
  }
  await twilioClient.messages.create({ body: message, from: TWILIO_FROM, to });
}
