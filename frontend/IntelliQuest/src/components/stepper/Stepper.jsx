import StepItem from "./StepItem";

const Stepper = ({ currentStep = 1 }) => {
  const steps = [
    { number: 1, label: "Upload" },
    { number: 2, label: "Configure" },
    { number: 3, label: "Review" },
  ];

  return (
    <div className="flex items-center justify-center gap-8 mb-12">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <StepItem
            number={step.number}
            label={step.label}
            isActive={currentStep === step.number}
            isCompleted={currentStep > step.number}
          />
          {index < steps.length - 1 && (
            <div className="w-24 h-0.5 bg-base-300 mx-4" />
          )}
        </div>
      ))}
    </div>
  );
};

export default Stepper;
