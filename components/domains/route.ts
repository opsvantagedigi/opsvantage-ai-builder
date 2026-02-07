import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { openProvider } from '@/lib/openprovider/client';
import { logger } from '@/lib/logger';

/**
 * Verifies the signature of the NowPayments IPN request.
 */
function verifyNowPaymentsSignature(payload: string, signature: string | null): boolean {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET_KEY;
  if (!ipnSecret || !signature) {
    logger.warn({ msg: 'IPN secret or signature missing, skipping verification.' });
    // In production, you should probably fail here if the secret is expected.
    return !ipnSecret;
  }

  const hmac = crypto.createHmac('sha512', ipnSecret);
  hmac.update(payload, 'utf-8');
  const expectedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Webhook to handle Instant Payment Notifications (IPN) from NowPayments.
 */
export async function POST(request: Request) {
  const bodyText = await request.text();
  const signature = headers().get('x-nowpayments-sig');

  if (!verifyNowPaymentsSignature(bodyText, signature)) {
    logger.error({ msg: 'Invalid NowPayments signature.' });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const payload = JSON.parse(bodyText);
    const { order_id: orderId, payment_status, price_amount, pay_amount } = payload;

    logger.info({ msg: 'Received NowPayments IPN', orderId, payment_status });

    // Find the order in our database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      logger.error({ msg: 'Webhook received for non-existent order', orderId });
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only process successful payments for pending orders
    if (payment_status === 'finished' && order.status === 'PENDING') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      });

      // --- Trigger Domain Registration ---
      if (order.productType === 'DOMAIN_REGISTRATION') {
        if (!order.user.openProviderHandle) {
          throw new Error(`User ${order.userId} does not have an OpenProvider handle.`);
        }

        const [name, ...extParts] = order.productId.split('.');
        const extension = extParts.join('.');

        const registrationPayload = {
          domain: { name, extension },
          period: 1, // Assuming 1-year registration
          owner_handle: order.user.openProviderHandle,
          admin_handle: order.user.openProviderHandle,
          tech_handle: order.user.openProviderHandle,
          // Set nameservers to Vercel's by default
          name_servers: [
            { name: 'ns1.vercel-dns.com' },
            { name: 'ns2.vercel-dns.com' },
          ],
        };

        const registrationResult = await openProvider.createDomain(registrationPayload);

        if (registrationResult.code !== 0 || !registrationResult.data?.id) {
          throw new Error(`OpenProvider registration failed: ${registrationResult.desc}`);
        }

        // Update order to COMPLETED with the OpenProvider order ID
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'COMPLETED',
            openProviderOrderId: String(registrationResult.data.id),
          },
        });

        logger.info({ msg: 'Domain successfully registered', orderId, domain: order.productId });
        // TODO: Call Vercel API to add the domain to the project
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error: any) {
    logger.error({ msg: 'Error processing NowPayments webhook', error: error.message });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}