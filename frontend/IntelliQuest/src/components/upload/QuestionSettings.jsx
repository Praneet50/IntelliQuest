/**
 * Question Settings Component
 *
 * Allows users to customize question generation parameters
 */
import CustomSelect from "../common/CustomSelect";

const getNextCourseOutcomeId = (courseOutcomes = []) => {
  const maxIndex = courseOutcomes.reduce((maxValue, co) => {
    const match = String(co?.id || "").match(/^CO(\d+)$/i);
    const value = match ? Number(match[1]) : 0;
    return Math.max(maxValue, value);
  }, 0);

  return `CO${maxIndex + 1}`;
};

const QuestionSettings = ({ settings, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const courseOutcomes = Array.isArray(settings.courseOutcomes)
    ? settings.courseOutcomes
    : [];

  const handleCourseOutcomeChange = (index, description) => {
    const nextCourseOutcomes = courseOutcomes.map((co, coIndex) =>
      coIndex === index ? { ...co, description } : co,
    );

    handleChange("courseOutcomes", nextCourseOutcomes);
  };

  const handleAddCourseOutcome = () => {
    const nextCourseOutcomes = [
      ...courseOutcomes,
      {
        id: getNextCourseOutcomeId(courseOutcomes),
        description: "",
      },
    ];

    handleChange("courseOutcomes", nextCourseOutcomes);
  };

  const handleRemoveCourseOutcome = (index) => {
    const nextCourseOutcomes = courseOutcomes.filter(
      (_, coIndex) => coIndex !== index,
    );

    handleChange("courseOutcomes", nextCourseOutcomes);
  };

  return (
    <div className="bg-base-200 border border-base-300 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-base-content mb-4">
        Question Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Question Type */}
        <CustomSelect
          label="Question Type"
          value={settings.questionType}
          onChange={(value) => handleChange("questionType", value)}
          options={[
            { value: "multiple-choice", label: "Multiple Choice" },
            { value: "true-false", label: "True/False" },
            { value: "short-answer", label: "Short Answer" },
          ]}
        />

        {/* Difficulty Level */}
        <CustomSelect
          label="Difficulty Level"
          value={settings.difficulty}
          onChange={(value) => handleChange("difficulty", value)}
          options={[
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
          ]}
        />

        {/* Number of Questions */}
        <CustomSelect
          label="Number of Questions"
          value={settings.numQuestions}
          onChange={(value) => handleChange("numQuestions", parseInt(value))}
          options={[3, 5, 7, 10, 15, 20].map((num) => ({
            value: num,
            label: `${num} Questions`,
          }))}
        />
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

      <div className="mt-6 border border-base-300 rounded-lg p-4 bg-base-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-base-content/90">
            Course Outcomes (CO)
          </h4>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={handleAddCourseOutcome}
          >
            Add CO
          </button>
        </div>

        <div className="space-y-3">
          {courseOutcomes.map((courseOutcome, index) => (
            <div key={courseOutcome.id} className="flex gap-2 items-start">
              <span className="badge badge-primary badge-outline mt-2 w-14 justify-center">
                {courseOutcome.id}
              </span>
              <input
                type="text"
                value={courseOutcome.description}
                onChange={(e) =>
                  handleCourseOutcomeChange(index, e.target.value)
                }
                placeholder={`Describe ${courseOutcome.id}`}
                className="input input-bordered flex-1"
              />
              {courseOutcomes.length > 1 && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleRemoveCourseOutcome(index)}
                  aria-label={`Remove ${courseOutcome.id}`}
                >
                  x
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionSettings;
