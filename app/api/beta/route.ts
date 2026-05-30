import { NextResponse } from 'next/server';
import { Resend } from 'resend';

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
    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined in environment variables.');
      return NextResponse.json(
        { error: 'Server configuration error: Resend API Key is missing.' },
        { status: 500 }
      );
    }

    // Initialize Resend SDK client
    const resend = new Resend(apiKey);

    let audienceId = process.env.RESEND_AUDIENCE_ID;

    // 2. Dynamic Audience Fallback: grab default list if not provided
    if (!audienceId) {
      console.log('RESEND_AUDIENCE_ID is empty. Fetching audiences list dynamically...');
      try {
        const audienceList = await resend.audiences.list();
        
        if (audienceList.error) {
          throw new Error(audienceList.error.message || 'Failed to retrieve audiences from Resend.');
        }

        const audiences = audienceList.data?.data || [];
        if (audiences.length === 0) {
          return NextResponse.json(
            { error: 'No Audiences found in your Resend account. Please create one on Resend Dashboard first.' },
            { status: 500 }
          );
        }

        // Grab default list
        audienceId = audiences[0].id;
        console.log(`Successfully resolved default Audience ID: ${audienceId}`);
      } catch (err: any) {
        console.error('Failed to resolve default audience list:', err);
        return NextResponse.json(
          { error: err.message || 'Failed to fetch default audience list from Resend.' },
          { status: 500 }
        );
      }
    }

    // 3. Create the contact inside that resolved audienceId
    const response = await resend.contacts.create({
      email: email.trim(),
      audienceId: audienceId,
      unsubscribed: false,
    });

    if (response.error) {
      console.error('Resend Contacts API Error:', response.error);
      return NextResponse.json(
        { error: response.error.message || 'Failed to register email contact in Resend.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, contactId: response.data?.id });
  } catch (error: any) {
    console.error('Internal server error in API route:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
