import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const STEPS = [
  { num: 1, label: 'Personal Info' },
  { num: 2, label: 'Summary' },
  { num: 3, label: 'Experience' },
  { num: 4, label: 'Education' },
  { num: 5, label: 'Skills & Projects' },
  { num: 6, label: 'Review' },
];

export default function StepIndicator({ currentStep, onStepClick }) {
  return (
    <div className="mb-8">
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-hairline">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      <div className="flex items-start justify-between">
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.num;
          const isActive = currentStep === step.num;
          const isClickable = currentStep >= step.num;

          return (
            <div key={step.num} className="flex flex-col items-center">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.num)}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all ${
                  isCompleted
                    ? 'bg-primary text-on-primary'
                    : isActive
                      ? 'bg-primary text-on-primary ring-4 ring-primary/20'
                      : 'bg-canvas-soft text-ink-mute border border-hairline'
                } ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.num
                )}
              </button>
              <span
                className={`mt-1.5 text-center text-xs font-medium leading-tight ${
                  isActive || isCompleted ? 'text-primary' : 'text-ink-mute'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
