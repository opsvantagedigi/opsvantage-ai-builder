/**
 * 💳 STRIPE CLIENT: Initialize the Stripe API
 *
 * This is the central point for all Stripe API calls.
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});
