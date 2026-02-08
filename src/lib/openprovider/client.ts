interface DomainCreationPayload {
  domainName: string;
  registrationPeriod: number;
  // Add other required properties as needed
}

// Stub for OpenProvider client API
export const openProvider = {
  async checkDomain(name: string, ext: string) {
    // Simulate a successful domain check
    return {
      code: 0,
      data: {
        results: [
          {
            status: 'available',
            domain: `${name}.${ext}`,
            price: {
              reseller: {
                price: 10,
                currency: 'USD',
              },
            },
            is_premium: false,
          },
        ],
      },
    };
  },
  async createDomain(payload: DomainCreationPayload) {
    // Simulate a successful domain registration
    return {
      code: 0,
      data: {
        id: 'mock-domain-id',
      },
      desc: 'Domain registered',
    };
  },
  async createCustomer(data: unknown) {
    // Simulate a successful customer creation
    return {
      code: 0,
      data: {
        handle: 'mock-handle',
      },
      desc: 'Success',
    };
  },
};
