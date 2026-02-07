const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

interface InvoicePayload {
  price_amount: number;
  price_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url?: string;
  success_url?: string;
  cancel_url?: string;
}

async function nowPaymentsFetch(endpoint: string, method: 'POST' | 'GET', body?: Record<string, unknown>) {
  const headers: HeadersInit = {
    'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
    'Content-Type': 'application/json',
  };

  const config: RequestInit = { method, headers };
  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${NOWPAYMENTS_API_URL}${endpoint}`, config);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'NowPayments API request failed.');
  }
  return response.json();
}

  createInvoice: (payload: InvoicePayload) => nowPaymentsFetch('/invoice', 'POST', payload as unknown as Record<string, unknown>),
export {};
};