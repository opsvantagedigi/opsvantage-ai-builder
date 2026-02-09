'use server';

import { authOptions } from '@/lib/auth';
import { openProvider } from '@/lib/openprovider/client';
import { prisma } from '@/lib/prisma';
import { nowPayments } from '@/lib/nowpayments/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const MARKUP = parseFloat(process.env.NEXT_PUBLIC_PRICING_MARKUP || "1.2");

export async function checkDomainAvailabilityAction(fullDomain: string) {
  const parts = fullDomain.split('.');
  const ext = parts.pop();
  const name = parts.join('.');
  if (!name || !ext) return { error: "Invalid format. Please include the extension (e.g., .com)." };

  try {
    const res = await openProvider.checkDomain(name, ext);
    if (res.code !== 0) throw new Error(res.desc);

    const result = res.data.results[0];
    
    if (result.price?.reseller) {
      const retailPrice = (result.price.reseller.price * MARKUP).toFixed(2);
      return { 
        status: result.status, 
        domain: result.domain, 
        price: { currency: result.price.reseller.currency, amount: retailPrice },
        isPremium: result.is_premium 
      };
    }
    return { status: result.status, domain: result.domain };
  } catch (error) {
    const err = error as Error;
    console.error("checkDomainAvailabilityAction Error:", err);
    return { error: err.message || "Availability check failed" };
  }
}

export async function registerDomainAction(domain: string, price: { amount: string, currency: string }, userId: string) {
  if (!userId) {
    return { error: 'You must be logged in to register a domain.' };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, openProviderHandle: true, email: true, name: true },
  });

  if (!user?.openProviderHandle) {
    // Signal to the client that we need to collect customer data.
    return { needsCustomerData: true, user: { email: user?.email, name: user?.name } };
  }

  try {
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          productId: domain,
          productType: 'DOMAIN_REGISTRATION',
          status: 'PENDING',
          priceAmount: parseFloat(price.amount),
          priceCurrency: price.currency,
        },
      });

    // 2. Create an invoice with NowPayments
    const invoice = await nowPayments.createInvoice({
      price_amount: parseFloat(price.amount),
      price_currency: price.currency,
      order_id: order.id,
      order_description: `Domain Registration: ${domain}`,
      ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments-domains`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/services/domains?payment=cancelled`,
    });

    if (!invoice.invoice_url) {
      throw new Error('Failed to create payment invoice.');
    }

    // 3. Update our order with the NowPayments invoice ID
    await prisma.order.update({
      where: { id: order.id },
      data: { nowPaymentsInvoiceId: invoice.id },
    });

    // 4. Return the payment URL to redirect the user
    return { paymentUrl: invoice.invoice_url };

  } catch (error) {
      const err = error as Error;
      console.error("registerDomainAction Error:", err);
      return { error: err.message || 'Failed to initiate domain registration.' };
  }
}