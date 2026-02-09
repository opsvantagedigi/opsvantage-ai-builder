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
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET_KEY;
  if (!ipnSecret || !signature) {
    logger.warn('IPN secret or signature missing, skipping verification.');
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
  const hdrs = await headers();
  const signature = hdrs.get('x-nowpayments-sig');

  if (!verifyNowPaymentsSignature(bodyText, signature)) {
    logger.error('Invalid NowPayments signature.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const payload = JSON.parse(bodyText);
    const { order_id: orderId, payment_status, price_amount, pay_amount } = payload;

    logger.info({ msg: 'Received NowPayments IPN', orderId, payment_status });
  logger.info(`Received NowPayments IPN: ${JSON.stringify({ orderId, payment_status })}`);

    // Find the order in our database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      logger.error(`Webhook received for non-existent order: ${orderId}`);
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

        logger.info(`Domain successfully registered: ${JSON.stringify({ orderId, domain: order.productId })}`);

        // --- Add Domain to Vercel Project ---
        // Find the user's latest project to associate the domain with.
        const member = await prisma.workspaceMember.findFirst({ where: { userId: order.userId } });
        if (!member) {
          throw new Error(`Could not find workspace for user ${order.userId}`);
        }
        const project = await prisma.project.findFirst({
          where: { workspaceId: member.workspaceId },
          orderBy: { createdAt: 'desc' },
        });

        if (project?.vercelProjectId) {
          await vercel.addDomainToProject(project.vercelProjectId, order.productId);
          logger.info(`Domain added to Vercel project: ${JSON.stringify({ vercelProjectId: project.vercelProjectId, domain: order.productId })}`);

          // Create a record in our own DB to track the domain
          await prisma.domain.create({
            data: { projectId: project.id, hostname: order.productId },
          });
        } else {
          logger.warn(`Could not add domain to Vercel: vercelProjectId not found for project: ${project?.id}`);
        }
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error: any) {
    logger.error(`Error processing NowPayments webhook: ${error.message}`);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}