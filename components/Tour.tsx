
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from './Icons';

export interface Step {
  targetId: string;
  title: string;
  content: string;
}

interface Props {
  run: boolean;
  steps: Step[];
  onFinish: () => void;
}

const Tour: React.FC<Props> = ({ run, steps, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Reset tour when run changes to true
  useEffect(() => {
    if (run) {
      setCurrentStep(0);
    }
  }, [run]);

  // Calculate position of the target element
  useLayoutEffect(() => {
    if (!run) return;
    
    const updateRect = () => {
      const step = steps[currentStep];
      if (!step) return;

      const element = document.getElementById(step.targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTargetRect(element.getBoundingClientRect());
      } else {
        // If element not found, skip to next step
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onFinish();
        }
      }
    };

    updateRect();
    
    // Update on resize
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [run, currentStep, steps, onFinish]);

  if (!run || !targetRect) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onFinish();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] overflow-hidden pointer-events-auto">
        {/* The Spotlight Overlay */}
        {/* We use a div positioned exactly over the target, with a massive box-shadow to darken everything else */}
        <div 
          className="absolute rounded-xl transition-all duration-500 ease-out pointer-events-none"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)', // The dimming effect
            zIndex: 10
          }}
        />

        {/* The Tooltip */}
        <div 
            className="absolute left-0 w-full px-4 transition-all duration-500 ease-out z-20 flex justify-center"
            style={{
                top: targetRect.bottom + 20 > window.innerHeight - 150 
                     ? targetRect.top - 180 // Show above if too close to bottom
                     : targetRect.bottom + 20
            }}
        >
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-slide-up relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 transform"></div>
                
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <h3 className="font-bold text-lg text-slate-900">{step.title}</h3>
                    <span className="text-xs font-bold text-brand-500 bg-brand-50 px-2 py-1 rounded-full">
                        {currentStep + 1} / {steps.length}
                    </span>
                </div>
                
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    {step.content}
                </p>

                <div className="flex justify-between items-center">
                    <button 
                        onClick={onFinish}
                        className="text-sm font-medium text-gray-400 hover:text-gray-600 px-2 py-1"
                    >
                        Skip
                    </button>
                    <button 
                        onClick={handleNext}
                        className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-brand-200 active:scale-95 transition-transform"
                    >
                        {isLastStep ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    </div>,
    document.body
  );
};

export default Tour;
