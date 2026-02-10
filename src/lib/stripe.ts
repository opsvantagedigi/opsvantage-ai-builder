import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_for_build", {
  apiVersion: "2026-01-28.clover",
  typescript: true,
});

export default stripe;