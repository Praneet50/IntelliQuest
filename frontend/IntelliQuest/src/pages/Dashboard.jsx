import MainLayout from "../components/layout/MainLayout";
import Stepper from "../components/stepper/Stepper";
import UploadContainer from "../components/upload/UploadContainer";
import PrimaryButton from "../components/common/PrimaryButton";

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12">
          <Stepper currentStep={1} />
          <UploadContainer />
        </div>

        {/* Bottom Action Bar */}
        <div className="border-t border-gray-800/50 bg-darker/30 backdrop-blur-sm px-8 py-6">
          <div className="max-w-4xl mx-auto flex justify-end">
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
    </MainLayout>
  );
};

export default Dashboard;
