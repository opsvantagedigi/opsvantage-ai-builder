import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { openProvider } from '@/lib/openprovider/client';
import { logger } from '@/lib/logger';
import { vercel } from '@/lib/vercel/client';

/**
 * Verifies the signature of the NowPayments IPN request.
 */
function verifyNowPaymentsSignature(payload: string, signature: string | null): boolean {
  // NOTE: Using the general IPN secret. Consider a separate one for domains for higher security.
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET_KEY;
  if (!ipnSecret || !signature) {
    logger.warn({ msg: 'Domain IPN secret or signature missing, skipping verification.' });
    return !ipnSecret;
  }

  const hmac = crypto.createHmac('sha512', ipnSecret);
  hmac.update(payload, 'utf-8');
  const expectedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Webhook to handle Instant Payment Notifications (IPN) for domain purchases.
 */
export async function POST(request: Request) {
  const bodyText = await request.text();
  const signature = headers().get('x-nowpayments-sig');

  if (!verifyNowPaymentsSignature(bodyText, signature)) {
    logger.error({ msg: 'Invalid NowPayments domain signature.' });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const payload = JSON.parse(bodyText);
    const { order_id: orderId, payment_status } = payload;

    logger.info({ msg: 'Received NowPayments Domain IPN', orderId, payment_status });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      logger.error({ msg: 'Webhook received for non-existent order', orderId });
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (payment_status === 'finished' && order.status === 'PENDING') {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } });

      if (order.productType === 'DOMAIN_REGISTRATION') {
        if (!order.user.openProviderHandle) {
          throw new Error(`User ${order.userId} does not have an OpenProvider handle for fulfillment.`);
        }

        const [name, ...extParts] = order.productId.split('.');
        const registrationPayload = {
          domain: { name, extension: extParts.join('.') },
          period: 1,
          owner_handle: order.user.openProviderHandle,
          admin_handle: order.user.openProviderHandle,
          tech_handle: order.user.openProviderHandle,
          name_servers: [{ name: 'ns1.vercel-dns.com' }, { name: 'ns2.vercel-dns.com' }],
        };

        const registrationResult = await openProvider.createDomain(registrationPayload);
        if (registrationResult.code !== 0 || !registrationResult.data?.id) {
          throw new Error(`OpenProvider registration failed: ${registrationResult.desc}`);
        }

        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'COMPLETED', openProviderOrderId: String(registrationResult.data.id) },
        });

        logger.info({ msg: 'Domain successfully registered', orderId, domain: order.productId });

        // Add domain to the user's latest Vercel project
        const member = await prisma.workspaceMember.findFirst({ where: { userId: order.userId } });
        if (member) {
          const project = await prisma.project.findFirst({
            where: { workspaceId: member.workspaceId },
            orderBy: { createdAt: 'desc' },
          });

          if (project?.vercelProjectId) {
            await vercel.addDomainToProject(project.vercelProjectId, order.productId);
            await prisma.domain.create({ data: { projectId: project.id, hostname: order.productId } });
            logger.info({ msg: 'Domain added to Vercel project', vercelProjectId: project.vercelProjectId, domain: order.productId });
          }
        }
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    const err = error as Error;
    logger.error({ msg: 'Error processing NowPayments domain webhook', error: err.message });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}