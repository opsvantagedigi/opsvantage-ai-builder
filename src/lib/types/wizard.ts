export type WizardState = {
    step: number;
    businessName: string;
    industry: string; // e.g., "Dental", "SaaS"
    goals: string[]; // e.g., ["Bookings", "Newsletter"]
    designVibe: 'minimal' | 'corporate' | 'playful' | 'futuristic';
    domain: {
        selected: string; // "mybusiness.com"
        status: 'available' | 'owned' | 'skip';
    };
    contactEmail: string;
};

export const INITIAL_WIZARD_STATE: WizardState = {
    step: 1,
    businessName: '',
    industry: '',
    goals: [],
    designVibe: 'minimal',
    domain: { selected: '', status: 'skip' },
    contactEmail: '',
};
