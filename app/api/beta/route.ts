import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 1. Client input validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    // 2. Server configuration checks
    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined in environment variables.');
      return NextResponse.json(
        { error: 'Server configuration error: Resend API Key is missing.' },
        { status: 500 }
      );
    }

    if (!audienceId) {
      console.error('RESEND_AUDIENCE_ID is not defined in environment variables.');
      return NextResponse.json(
        { error: 'Server configuration error: Resend Audience ID is missing.' },
        { status: 500 }
      );
    }

    // 3. Submit request to Resend Contacts API
    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        unsubscribed: false,
      }),
    });

    const data = await res.json();

    // 4. Handle response states from Resend
    if (!res.ok) {
      console.error('Resend API Error:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to add contact to Resend.' },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, contactId: data.id });
  } catch (error: any) {
    console.error('Internal server error in API route:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
