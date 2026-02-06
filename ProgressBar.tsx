import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center mb-4">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <React.Fragment key={step}>
          <span
            className={`text-sm font-semibold transition-all duration-300 ${
              step === currentStep ? 'text-lg text-blue-600 font-bold' : 'text-gray-400'
            }`}
          >
            {step}
          </span>
          {step < totalSteps && (
            <span
              className={`mx-2 h-1 w-8 rounded-full transition-colors duration-300 ${
                step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            ></span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressBar;