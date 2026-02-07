import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateColorPalette, generateFontPairing, generateImage } from '../design-assistant';

const mocks = vi.hoisted(() => {
    const generateContent = vi.fn();
    return {
        openai: {
            images: {
                generate: vi.fn(),
            },
        },
        generateContent: generateContent,
        getGenerativeModel: vi.fn(() => ({
            generateContent: generateContent,
        })),
    };
});

vi.mock('openai', () => ({
    default: class {
        images = mocks.openai.images;
    },
}));

vi.mock('../gemini', () => ({
    getGenerativeModel: mocks.getGenerativeModel,
}));

describe('Design Assistant AI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.OPENAI_API_KEY = 'test-key';
        // Reset the generateContent mock implementation
        mocks.getGenerativeModel.mockReturnValue({
            generateContent: mocks.generateContent,
        });
    });

    describe('generateColorPalette', () => {
        it('should return a valid color palette', async () => {
            const mockResponse = JSON.stringify({
                primary: '#000000',
                secondary: '#ffffff',
                accent: '#ff0000',
                background: '#f0f0f0',
                text: '#333333',
            });

            mocks.generateContent.mockResolvedValue({
                response: {
                    text: () => `\`\`\`json\n${mockResponse}\n\`\`\``,
                },
            });

            const palette = await generateColorPalette({ businessName: 'Tech startup' });
            expect(palette).toEqual(JSON.parse(mockResponse));
            expect(mocks.generateContent).toHaveBeenCalled();
        });

        it('should handle JSON parsing errors gracefully', async () => {
            mocks.generateContent.mockResolvedValue({
                response: {
                    text: () => 'Invalid JSON',
                },
            });

            await expect(generateColorPalette({ businessName: 'Test' })).rejects.toThrow();
        });
    });

    describe('generateImage', () => {
        it('should return an image URL on success', async () => {
            const mockUrl = 'https://example.com/image.png';
            mocks.openai.images.generate.mockResolvedValue({
                data: [{ url: mockUrl }],
            });

            const result = await generateImage('A futuristic hero image');
            expect(result).toEqual({ url: mockUrl });
            expect(mocks.openai.images.generate).toHaveBeenCalledWith(expect.objectContaining({
                prompt: 'A futuristic hero image',
                model: 'dall-e-3',
            }));
        });

        it('should return placeholder if API fails', async () => {
            mocks.openai.images.generate.mockRejectedValue(new Error('API Error'));

            const result = await generateImage('Test');
            expect(result).toEqual({ url: expect.stringContaining('via.placeholder.com') });
        });
    });
});
