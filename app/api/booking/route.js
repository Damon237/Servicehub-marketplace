import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { 
  customerName = "Valued Customer", 
  customerEmail = "No email provided", 
  startDate, 
  endDate, 
  serviceName = "Service", 
  providerEmail 
} = await req.json();

    const data = await resend.emails.send({
      from: 'ServiceHub <notifications@servicehub.kemmoe>',
      to: [providerEmail], // Sends to the artisan/provider
      subject: `Action Required: New Booking Request for ${serviceName}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Service Request</h2>
          <p>Hello,</p>
          <p>You have received a new booking request through the <strong>ServiceHub</strong> marketplace.</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Customer:</strong> ${customerName}</p>
            <p style="margin: 5px 0;"><strong>Contact:</strong> ${customerEmail}</p>
            <p style="margin: 5px 0;"><strong>Service Dates:</strong> ${startDate} — ${endDate}</p>
          </div>

          <p>Please log in to your dashboard to manage this request and coordinate with the client.</p>
          
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/provider-dashboard" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
             View Dashboard
          </a>

          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #666;">This is an automated notification from ServiceHub Cameroon. Please do not reply directly to this email.</p>
        </div>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}