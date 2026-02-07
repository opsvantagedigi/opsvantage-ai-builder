// Minimal NowPayments client stub for development
export const nowPayments = {
  async createInvoice({ price_amount, price_currency, order_id, order_description, ipn_callback_url, success_url, cancel_url }: {
    price_amount: number;
    price_currency: string;
    order_id: string;
    order_description: string;
    ipn_callback_url: string;
    success_url: string;
    cancel_url: string;
  }) {
    // Simulate invoice creation
    return {
      invoice_url: 'https://nowpayments.io/invoice/mock',
      id: 'mock-invoice-id',
    };
  },
  async createSubscription(payload: unknown) {
    return {
      invoice_url: 'https://nowpayments.io/invoice/sub-mock',
      subscription_id: 'mock-sub-id',
      status: 'waiting',
    };
  },
};
