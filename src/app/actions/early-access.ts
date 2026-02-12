'use server';

import { db } from '@/lib/db';

export async function submitEarlyAccessEmail(email: string) {
  try {
    // Validate email
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Invalid email address' };
    }

    // Check if email already exists
    const existing = await db.earlyAccessSignup?.findUnique({
      where: { email },
    }).catch(() => null);

    if (existing) {
      return { success: false, error: 'Email already registered' };
    }

    // Store email for early access list
    // (You'll need to add this model to your schema)
    // await db.earlyAccessSignup.create({
    //   data: { email, signedUpAt: new Date() }
    // });

    // TODO: Send confirmation email via Resend/SendGrid
    // await sendConfirmationEmail(email);

    return { success: true, message: 'Thanks for signing up!' };
  } catch (error) {
    console.error('[MARZ] Early access signup error:', error);
    return { success: false, error: 'Something went wrong' };
  }
}
