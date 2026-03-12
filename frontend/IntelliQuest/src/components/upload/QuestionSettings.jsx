/**
 * Question Settings Component
 *
 * Allows users to customize question generation parameters
 */

const QuestionSettings = ({ settings, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <div className="bg-base-200 border border-base-300 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-base-content mb-4">
        Question Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-base-content/80 mb-2">
            Question Type
          </label>
          <select
            value={settings.questionType}
            onChange={(e) => handleChange("questionType", e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="true-false">True/False</option>
            <option value="short-answer">Short Answer</option>
          </select>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-medium text-base-content/80 mb-2">
            Difficulty Level
          </label>
          <select
            value={settings.difficulty}
            onChange={(e) => handleChange("difficulty", e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Number of Questions */}
        <div>
          <label className="block text-sm font-medium text-base-content/80 mb-2">
            Number of Questions
          </label>
          <select
            value={settings.numQuestions}
            onChange={(e) =>
              handleChange("numQuestions", parseInt(e.target.value))
            }
            className="select select-bordered w-full"
          >
            {[3, 5, 7, 10, 15, 20].map((num) => (
              <option key={num} value={num}>
                {num} Questions
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Settings Summary */}
      <div className="mt-4 p-3 bg-base-300 rounded-lg">
        <p className="text-sm text-base-content/70">
          <span className="text-primary font-semibold">Summary:</span> Generate{" "}
          {settings.numQuestions} {settings.questionType.replace("-", " ")}{" "}
          question{settings.numQuestions !== 1 ? "s" : ""} at{" "}
          {settings.difficulty} difficulty level
        </p>
      </div>
    </div>
  );
};

export default QuestionSettings;
