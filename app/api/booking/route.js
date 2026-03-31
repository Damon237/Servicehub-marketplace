import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import GlobalApi from '@/app/_services/GlobalApi';

const resend = new Resend(process.env.RESEND_API_KEY);

// This line is CRITICAL to prevent the "Failed to collect page data" build error on Vercel
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      businessId, 
      startDate, 
      endDate, 
      userEmail, 
      userName, 
      providerEmail, 
      businessName 
    } = body;

    // 1. Validation Check
    if (!businessId || !userEmail || !providerEmail) {
      return NextResponse.json(
        { error: 'Missing required booking information' }, 
        { status: 400 }
      );
    }

    // 2. Database Transaction (Hygraph)
    // FIX: Changed createNewBooking to createIntervalBooking to match your GlobalApi
    // and handle the startDate/endDate range correctly.
    const bookingResp = await GlobalApi.createIntervalBooking(
      businessId, 
      startDate, 
      endDate, 
      userEmail, 
      userName
    );

    if (!bookingResp) {
      throw new Error('Database insertion failed');
    }

    // 3. Email Notification via Resend
    await resend.emails.send({
      from: 'ServiceHub <notifications@resend.dev>', 
      to: [providerEmail], 
      subject: `Action Required: New Booking Request for ${businessName}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Service Request</h2>
          <p>Hello,</p>
          <p>You have received a new booking request through the <strong>ServiceHub</strong> marketplace.</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Customer:</strong> ${userName}</p>
            <p style="margin: 5px 0;"><strong>Contact:</strong> ${userEmail}</p>
            <p style="margin: 5px 0;"><strong>Service Dates:</strong> ${startDate} — ${endDate}</p>
          </div>

          <p>Please log in to your dashboard to manage this request and coordinate with the client.</p>
          
          <a href="${process.env.NEXTAUTH_URL}/my-booking" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
             View Dashboard
          </a>

          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #666;">This is an automated notification from ServiceHub Cameroon. Please do not reply directly to this email.</p>
        </div>
      `
    });

    return NextResponse.json({ 
      message: 'Booking confirmed and provider notified', 
      bookingId: bookingResp.createBooking?.id 
    }, { status: 201 });

  } catch (error) {
    console.error("Critical Booking Error:", error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message }, 
      { status: 500 }
    );
  }
}