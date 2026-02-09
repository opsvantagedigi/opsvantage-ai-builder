'use server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nowPayments } from '@/lib/nowpayments/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

interface PaymentDetails {
  domain: string;
  price: {
    amount: string;
    currency: string;
  };
}

export async function createPaymentAction(details: PaymentDetails, userId: string) {
  if (!userId) {
    return { error: 'User not authenticated.' };
  }

  try {
    // 1. Create an order record in your database
    const order = await prisma.order.create({
      data: {
        userId: userId,
        productId: details.domain,
        productType: 'DOMAIN_REGISTRATION',
        status: 'PENDING',
        priceAmount: parseFloat(details.price.amount),
        priceCurrency: details.price.currency.toLowerCase(),
      },
    });

    // 2. Create an invoice with NowPayments
    const invoice = await nowPayments.createInvoice({
      price_amount: order.priceAmount,
      price_currency: order.priceCurrency,
      order_id: order.id, // Use our internal order ID
      order_description: `Domain Registration: ${details.domain}`,
      // IMPORTANT: Replace these URLs with your actual production URLs
      ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?orderId=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-cancelled?orderId=${order.id}`,
    });

    // 3. Update our order with the NowPayments invoice ID
    await prisma.order.update({
      where: { id: order.id },
      data: { nowPaymentsInvoiceId: invoice.id },
    });

    // 4. Return the payment URL to the client for redirection
    return { paymentUrl: invoice.invoice_url };
  } catch (error: any) {
    console.error("Payment Creation Error:", error);
    return { error: error.message || "Failed to create payment." };
  }
}