import { useState } from "react";
import { jsPDF } from "jspdf";
import QuestionSettings from "./QuestionSettings";
import { uploadFile } from "../../services/api";
import { useSession } from "../../context/SessionContext";

const QuestionDisplay = ({ questions }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [showRegenerateSettings, setShowRegenerateSettings] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { currentUploadData, currentSession, setQuestions } = useSession();

  const [questionSettings, setQuestionSettings] = useState({
    questionType: "multiple-choice",
    difficulty: "medium",
    numQuestions: 5,
  });

  if (!questions || questions.length === 0) {
    return null;
  }

  const handleSettingsChange = (newSettings) => {
    setQuestionSettings(newSettings);
  };

  const handleRegenerate = async () => {
    if (!currentUploadData?.file) {
      alert("File data not available. Please upload the file again.");
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await uploadFile(
        currentUploadData.file,
        questionSettings,
      );

      setQuestions(response.data.questions, currentUploadData);
      setShowRegenerateSettings(false);
    } catch (err) {
      console.error("Regenerate error:", err);
      alert(err.message || "Failed to regenerate questions. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExport = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    let y = margin;

    const ensureSpace = (heightNeeded = 8) => {
      if (y + heightNeeded > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const writeWrappedText = (text, fontSize = 11, lineGap = 5) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(String(text), contentWidth);

      lines.forEach((line) => {
        ensureSpace(lineGap);
        doc.text(line, margin, y);
        y += lineGap;
      });
    };

    doc.setFont("helvetica", "bold");
    writeWrappedText("IntelliQuest - Generated Questions", 16, 7);
    y += 2;
    doc.setFont("helvetica", "normal");
    writeWrappedText(`Total Questions: ${questions.length}`, 11, 6);
    y += 4;

    questions.forEach((q, index) => {
      ensureSpace(12);
      doc.setFont("helvetica", "bold");
      writeWrappedText(`Question ${index + 1}: ${q.question}`, 12, 6);
      doc.setFont("helvetica", "normal");

      if (q.options && q.options.length > 0) {
        q.options.forEach((option, optIndex) => {
          writeWrappedText(
            `${String.fromCharCode(65 + optIndex)}. ${option}`,
            11,
            5,
          );
        });
      }

      if (q.correctAnswer) {
        writeWrappedText(`Correct Answer: ${q.correctAnswer}`, 11, 5);
      }

      if (q.explanation) {
        writeWrappedText(`Explanation: ${q.explanation}`, 11, 5);
      }

      y += 3;
    });

    const rawName =
      currentSession?.originalFilename ||
      currentUploadData?.filename ||
      "generated-questions";

    const baseName = rawName.replace(/\.[^/.]+$/, "").trim();
    const safeName = (baseName || "generated-questions")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .replace(/\s+/g, " ")
      .trim();

    doc.save(`${safeName}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto mt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-base-content mb-2">
            Generated Questions
          </h2>
          <p className="text-base-content/70">
            {questions.length}{" "}
            {questions.length === 1 ? "question" : "questions"} generated from
            your document
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRegenerateSettings(!showRegenerateSettings)}
            className="btn btn-primary"
            disabled={isRegenerating}
          >
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Regenerate
          </button>
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="btn btn-outline"
          >
            {showAnswers ? "Hide Answers" : "Show Answers"}
          </button>
        </div>
      </div>

      {/* Regenerate Settings Panel */}
      {showRegenerateSettings && (
        <div className="mb-6">
          <div className="bg-base-200 border border-base-300 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-base-content mb-4">
              Customize and Regenerate Questions
            </h3>
            <QuestionSettings
              settings={questionSettings}
              onChange={handleSettingsChange}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className={`btn btn-primary ${
                  isRegenerating ? "btn-disabled" : ""
                }`}
              >
                {isRegenerating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "Generate New Questions"
                )}
              </button>
              <button
                onClick={() => setShowRegenerateSettings(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div
            key={index}
            className="p-6 bg-base-200 border border-base-300 rounded-xl hover:border-base-content/30 transition-colors"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-base-content mb-4">
                  {question.question}
                </h3>

                {question.options && question.options.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optIndex) => {
                      const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D
                      const isCorrect =
                        showAnswers && question.correctAnswer === optionLabel;

                      return (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg border transition-all ${
                            isCorrect
                              ? "border-green-500 bg-green-500/10"
                              : "border-base-300 bg-base-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-semibold ${
                                isCorrect
                                  ? "text-green-500"
                                  : "text-base-content/70"
                              }`}
                            >
                              {optionLabel}.
                            </span>
                            <span
                              className={
                                isCorrect
                                  ? "text-green-500"
                                  : "text-base-content/90"
                              }
                            >
                              {option}
                            </span>
                            {isCorrect && (
                              <svg
                                className="w-5 h-5 text-green-500 ml-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {showAnswers && question.correctAnswer && (
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/50 rounded-lg">
                    <p className="text-sm text-primary">
                      <span className="font-semibold">Correct Answer:</span>{" "}
                      {question.correctAnswer}
                    </p>
                  </div>
                )}

                {showAnswers && question.explanation && (
                  <div className="mt-3 p-3 bg-base-300 border border-base-300 rounded-lg">
                    <p className="text-sm text-base-content/70">
                      <span className="font-semibold text-base-content/90">
                        Explanation:
                      </span>{" "}
                      {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <button onClick={handleExport} className="btn btn-primary">
          Export Questions
        </button>
      </div>
    </div>
  );
};

export default QuestionDisplay;
