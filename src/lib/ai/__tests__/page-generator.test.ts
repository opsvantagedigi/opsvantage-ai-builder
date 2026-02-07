import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePageData } from '../page-generator';
import type { Page } from '@/types/db';
import type { OnboardingData } from '@/types/onboarding';

// Mock dependencies
const mocks = vi.hoisted(() => {
    const generateContent = vi.fn();
    return {
        generateContent,
        getGenerativeModel: vi.fn(() => ({
            generateContent,
        })),
    };
});

vi.mock('../gemini', () => ({
    getGenerativeModel: mocks.getGenerativeModel,
}));

// Mock Next.js cache
vi.mock('next/cache', () => ({
    unstable_cache: (fn: any) => fn, // Bypass cache
}));

describe('Page Generator AI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getGenerativeModel.mockReturnValue({
            generateContent: mocks.generateContent,
        });
    });

    const mockOnboarding: OnboardingData = {
        businessName: 'Test Biz',
        description: 'A test business',
        brandVoice: 'Professional',
        targetAudience: 'Everyone',
        industry: 'Tech',
        colorPalette: ['Blue'],
        goals: 'Sales',
    };

    const mockPage: Page = {
        id: 'page1',
        projectId: 'proj1',
        title: 'Home',
        slug: 'home',
        type: 'HOME',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // @ts-ignore - isPublished undefined in type definition shown but used in test
    };

    it('should generate page data successfully', async () => {
        const mockResponseData = {
            seoTitle: 'Test Title',
            seoDescription: 'Test Description',
            structuredData: {},
            sections: [
                {
                    type: 'HERO',
                    variant: 'default',
                    data: { headline: 'Welcome' },
                },
            ],
        };

        const mockResponseText = `\`\`\`json\n${JSON.stringify(mockResponseData)}\n\`\`\``;

        mocks.generateContent.mockResolvedValue({
            response: {
                text: () => mockResponseText,
            },
        });

        const result = await generatePageData(mockOnboarding, mockPage);

        expect(result).toEqual(mockResponseData);
        expect(mocks.generateContent).toHaveBeenCalled();
    });

    it('should throw error on invalid JSON', async () => {
        mocks.generateContent.mockResolvedValue({
            response: {
                text: () => 'Invalid Response',
            },
        });

        await expect(generatePageData(mockOnboarding, mockPage)).rejects.toThrow('Invalid AI response format');
    });
});
