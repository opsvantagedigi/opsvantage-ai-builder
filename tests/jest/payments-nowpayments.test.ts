import { nowPayments } from '@/lib/nowpayments/client';

describe('NowPayments client (stub) scaffold', () => {
  test('createInvoice returns a usable invoice payload', async () => {
    const invoice = await nowPayments.createInvoice({
      price_amount: 10,
      price_currency: 'USD',
      order_id: 'order_test_123',
      order_description: 'Test invoice',
      ipn_callback_url: 'http://localhost:3000/api/webhooks/nowpayments',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    expect(invoice).toBeTruthy();
    expect(typeof invoice.id).toBe('string');
    expect(typeof invoice.invoice_url).toBe('string');
    expect(invoice.invoice_url).toMatch(/^https?:\/\//);
  });
});
