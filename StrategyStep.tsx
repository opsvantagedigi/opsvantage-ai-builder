import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import { OnboardingData } from '@/app/onboarding/page';

// Assuming these props are passed from a parent wizard component
interface StrategyStepProps {
  onNext: (data: { goals: string; competitors: string[] }) => void;
  onBack: () => void;
  onSaveAndExit: () => void;
  initialData: Partial<OnboardingData>;
}

const StrategyStep: React.FC<StrategyStepProps> = ({ onNext, onBack, onSaveAndExit, initialData }) => {
  const [goals, setGoals] = useState(initialData.goals || 'Number one in web development and ultimate peoples choice');
  const [competitors, setCompetitors] = useState<string[]>(initialData.competitors || ['10web.io']);
  const [competitorInput, setCompetitorInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddCompetitor = () => {
    const newCompetitor = competitorInput.trim();
    if (newCompetitor) {
      // Basic URL validation
      if (!newCompetitor.includes('.') || newCompetitor.length < 4) {
        setError('Please enter a valid URL.');
        return;
      }
      if (!competitors.includes(newCompetitor)) {
        setCompetitors([...competitors, newCompetitor]);
        setError(null);
      }
      setCompetitorInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      handleAddCompetitor();
    }
  };

  const removeCompetitor = (indexToRemove: number) => {
    setCompetitors(competitors.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The `competitors` state is already an array of strings.
    const apiPayload = {
      goals,
      competitors,
    };

    // Here you would typically call your API.
    // For this example, we'll just pass the data to the parent.
    console.log('Submitting to API:', apiPayload);
    onNext(apiPayload);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <ProgressBar currentStep={3} totalSteps={5} />
        <h1 className="text-3xl font-bold text-gray-800">Your Business Strategy</h1>
        <p className="text-gray-600 mt-2">
          Tell us about your objectives and key competitors. This helps our AI craft a unique and effective website for you.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="goals" className="block text-lg font-medium text-gray-700 mb-2">
            What are the primary goals for your website?
          </label>
          <textarea
            id="goals"
            name="goals"
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="e.g., Generate more leads, sell products, build brand awareness..."
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            required
          />
        </div>

        <div className="mb-8">
          <label htmlFor="competitors" className="block text-lg font-medium text-gray-700 mb-2">
            Who are your main competitors?
          </label>
          <div className="flex flex-wrap items-center w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white">
            {competitors.map((competitor, index) => (
              <div key={index} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium mr-2 mb-2 px-3 py-1 rounded-full">
                {competitor} ✨
                <button
                  type="button"
                  onClick={() => removeCompetitor(index)}
                  className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                  aria-label={`Remove ${competitor}`}
                >
                  &times;
                </button>
              </div>
            ))}
            <input
              id="competitors"
              type="text"
              className="flex-grow p-1 mb-2 outline-none bg-transparent"
              placeholder={competitors.length === 0 ? "Enter a URL and press Enter or comma..." : ""}
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAddCompetitor} // Add competitor when input loses focus
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          <p className="text-sm text-gray-500 mt-2">Enter their website URLs. Press Enter or comma after each one.</p>
        </div>

        <div className="flex justify-between items-center mt-10">
          <button type="button" onClick={onBack} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition">Back</button>
          <button type="button" onClick={onSaveAndExit} className="px-6 py-2 text-blue-600 hover:underline">Save & Exit</button>
          <button type="submit" className="px-8 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition font-semibold">Next</button>
        </div>
      </form>
    </div>
  );
};

export default StrategyStep;