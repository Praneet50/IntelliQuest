import { useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import Stepper from "../components/stepper/Stepper";
import UploadContainer from "../components/upload/UploadContainer";
import QuestionDisplay from "../components/upload/QuestionDisplay";
import PrimaryButton from "../components/common/PrimaryButton";
import { useSession } from "../context/SessionContext";

const Dashboard = () => {
  const { generatedQuestions, setQuestions, startNewSession } = useSession();

  const handleQuestionsGenerated = (data, uploadData) => {
    setQuestions(data.questions, uploadData);
  };

  const handleGenerateMore = () => {
    startNewSession();
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12">
          <Stepper currentStep={generatedQuestions ? 2 : 1} />

          {!generatedQuestions ? (
            <UploadContainer onQuestionsGenerated={handleQuestionsGenerated} />
          ) : (
            <QuestionDisplay questions={generatedQuestions} />
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="border-t border-base-300 bg-base-200 backdrop-blur-sm px-8 py-6">
          <div className="max-w-4xl mx-auto flex justify-between">
            {generatedQuestions && (
              <button
                onClick={handleGenerateMore}
                className="btn btn-outline btn-secondary"
              >
                Upload New File
              </button>
            )}
            <div className={generatedQuestions ? "" : "ml-auto"}>
              <PrimaryButton
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                }
              >
                Next Step
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
