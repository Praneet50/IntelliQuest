/**
 * Question Service Module
 *
 * This module handles AI-powered question generation using Google Gemini API
 * Supports various question types and difficulty levels
 */

/**
 * Generate questions from extracted text using AI
 *
 * @param {string} text - Extracted text content
 * @param {Object} options - Question generation options
 * @param {string} options.questionType - Type of questions (multiple-choice, true-false, short-answer, essay)
 * @param {string} options.difficulty - Difficulty level (easy, medium, hard)
 * @param {number} options.numQuestions - Number of questions to generate
 * @returns {Promise<Array>} - Array of generated questions
 */
export async function generateQuestions(text, options = {}) {
  const {
    questionType = "multiple-choice",
    difficulty = "medium",
    numQuestions = 5,
  } = options;
  const allowMockQuestions = process.env.ALLOW_MOCK_QUESTIONS === "true";

  console.log(
    `Generating ${numQuestions} ${questionType} questions at ${difficulty} difficulty`,
  );

  // Check if Gemini API key is configured
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "") {
    try {
      console.log("Using Gemini API for question generation...");
      return await callGeminiAPI(text, options);
    } catch (error) {
      console.error("Gemini API error:", error.message);

      if (allowMockQuestions) {
        console.warn("ALLOW_MOCK_QUESTIONS=true, returning mock questions.");
        return generateMockQuestions(
          text,
          questionType,
          difficulty,
          numQuestions,
        );
      }

      throw new Error(`Question generation failed: ${error.message}`);
    }
  } else {
    console.warn("GEMINI_API_KEY not configured.");

    if (allowMockQuestions) {
      console.warn(
        "ALLOW_MOCK_QUESTIONS=true and no API key is configured, returning mock questions.",
      );
      return generateMockQuestions(
        text,
        questionType,
        difficulty,
        numQuestions,
      );
    }

    throw new Error(
      "Gemini API key is not configured. Set GEMINI_API_KEY in backend/.env.",
    );
  }
}

/**
 * Call Google Gemini API for question generation
 *
 * @param {string} text - Content to generate questions from
 * @param {Object} options - Generation options
 * @returns {Promise<Array>} - Generated questions
 */
async function callGeminiAPI(text, options) {
  // Use REST API directly
  const modelName = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
  const apiKey = process.env.GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

  console.log(`Calling Gemini API with model: ${modelName}`);

  const requestGemini = async (prompt) => {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error response:", errorData);
      throw new Error(`Gemini API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    console.log("Gemini API response:", JSON.stringify(data, null, 2));

    const candidate = data.candidates?.[0];
    const generatedText = candidate?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error(
        "No text in response. Full response:",
        JSON.stringify(data),
      );
      throw new Error("No text generated from Gemini API");
    }

    return {
      generatedText,
      finishReason: candidate?.finishReason,
    };
  };

  const primaryPrompt = buildPromptForLLM(text, options, {
    sourceCharLimit: 2000,
    concise: false,
  });

  let result = await requestGemini(primaryPrompt);

  if (result.finishReason === "MAX_TOKENS") {
    console.warn(
      "Gemini response hit MAX_TOKENS. Retrying with a more compact prompt.",
    );

    const compactPrompt = buildPromptForLLM(text, options, {
      sourceCharLimit: 1200,
      concise: true,
    });

    result = await requestGemini(compactPrompt);
  }

  if (result.finishReason === "MAX_TOKENS") {
    throw new Error(
      "Gemini response was truncated by MAX_TOKENS. Try fewer questions or a shorter document.",
    );
  }

  console.log(
    "Generated text from Gemini:",
    result.generatedText.substring(0, 200),
  );

  // Parse and return the questions
  return parseAIResponse(result.generatedText);
}

/**
 * Build prompt for LLM based on question requirements
 *
 * Creates a well-structured prompt with instructions for the AI
 *
 * @param {string} text - Source text
 * @param {Object} options - Question options
 * @returns {string} - Formatted prompt
 */
function buildPromptForLLM(text, options, promptOptions = {}) {
  const { questionType, difficulty, numQuestions } = options;
  const { sourceCharLimit = 3000, concise = false } = promptOptions;
  const sourceText = text.substring(0, sourceCharLimit);
  const explanationInstruction = concise
    ? "Keep explanations extremely short, with no more than one sentence each."
    : "Keep explanations brief and directly tied to the source text.";

  const promptTemplates = {
    "multiple-choice": `Generate ${numQuestions} multiple-choice questions based on the following text. Each question should have 4 options (A, B, C, D) with one correct answer. Difficulty level: ${difficulty}. ${explanationInstruction}

IMPORTANT: Return ONLY a valid JSON array. Do not include any markdown formatting, code blocks, or explanatory text. Use double quotes for all strings.

Format your response exactly like this:
[
  {
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "A",
    "explanation": "Brief explanation of why this is correct"
  }
]

Text content:
${sourceText}`,

    "true-false": `Generate ${numQuestions} true/false questions based on the following text. Difficulty level: ${difficulty}. ${explanationInstruction}

IMPORTANT: Return ONLY a valid JSON array. Do not include any markdown formatting, code blocks, or explanatory text. Use double quotes for all strings.

Format your response exactly like this:
[
  {
    "question": "Statement here",
    "correctAnswer": true,
    "explanation": "Explanation of the answer"
  }
]

Text content:
${sourceText}`,

    "short-answer": `Generate ${numQuestions} short-answer questions based on the following text. Difficulty level: ${difficulty}. ${explanationInstruction}

IMPORTANT: Return ONLY a valid JSON array. Do not include any markdown formatting, code blocks, or explanatory text. Use double quotes for all strings.

Format your response exactly like this:
[
  {
    "question": "Question text here?",
    "sampleAnswer": "A good sample answer",
    "keyPoints": ["Key point 1", "Key point 2"]
  }
]

Text content:
${sourceText}`,

    essay: `Generate ${numQuestions} essay questions based on the following text. Difficulty level: ${difficulty}. ${explanationInstruction}

IMPORTANT: Return ONLY a valid JSON array. Do not include any markdown formatting, code blocks, or explanatory text. Use double quotes for all strings.

Format your response exactly like this:
[
  {
    "question": "Essay prompt here",
    "guidelines": "What should be included in a good response",
    "suggestedLength": "Approximate word count"
  }
]

Text content:
${sourceText}`,
  };

  return promptTemplates[questionType] || promptTemplates["multiple-choice"];
}

/**
 * Parse AI response and extract structured questions
 *
 * Handles various response formats from different LLM providers
 *
 * @param {string} responseText - Raw AI response
 * @param {string} questionType - Type of questions
 * @returns {Array} - Parsed questions
 */
function parseAIResponse(responseText, questionType) {
  try {
    console.log("Parsing AI response. Length:", responseText.length);
    console.log("First 500 chars:", responseText.substring(0, 500));

    // Remove markdown code blocks if present
    let cleanedText = responseText
      .replace(/```json\s*/gi, "")
      .replace(/```javascript\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    // Try to extract JSON array from the response
    const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      console.log("Found JSON array in response");
      let jsonText = jsonMatch[0];

      try {
        // First, try parsing as-is (might be valid JSON)
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`Successfully parsed ${parsed.length} questions`);
          return parsed;
        }
      } catch (firstError) {
        console.log(
          "Direct parse failed, attempting to fix JavaScript object literals",
        );

        // If that fails, try converting JavaScript object literals to JSON
        // This is a simple approach - replace unquoted keys and single-quoted strings
        try {
          // Use Function constructor to evaluate JavaScript object literal safely
          // Note: This evaluates the code, so only use with trusted AI responses
          const evaluatedArray = new Function("return " + jsonText)();

          if (Array.isArray(evaluatedArray) && evaluatedArray.length > 0) {
            console.log(
              `Successfully evaluated ${evaluatedArray.length} questions from JS literals`,
            );
            return evaluatedArray;
          }
        } catch (evalError) {
          console.error("Evaluation also failed:", evalError.message);
          throw firstError; // Throw the original parsing error
        }
      }
    }

    // If no JSON array found, try to parse the entire cleaned response
    console.log("No JSON array found, trying to parse entire response");
    const parsed = JSON.parse(cleanedText);
    if (Array.isArray(parsed)) {
      console.log(
        `Successfully parsed ${parsed.length} questions from direct parse`,
      );
      return parsed;
    }

    console.error("Response is not an array");
    throw new Error("Could not parse AI response - not a valid array");
  } catch (error) {
    console.error("Error parsing AI response:", error.message);
    console.error(
      "Response text that failed to parse (first 1000 chars):",
      responseText.substring(0, 1000),
    );
    throw new Error(
      `Failed to parse question data from AI response: ${error.message}`,
    );
  }
}

/**
 * Generate mock questions for testing purposes
 *
 * This function generates sample questions based on the text
 * Used as a placeholder until LLM integration is complete
 *
 * @param {string} text - Source text
 * @param {string} questionType - Type of questions
 * @param {string} difficulty - Difficulty level
 * @param {number} numQuestions - Number of questions
 * @returns {Array} - Mock questions
 */
function generateMockQuestions(text, questionType, difficulty, numQuestions) {
  const textPreview = text.substring(0, 100) + "...";

  const mockQuestions = {
    "multiple-choice": Array.from({ length: numQuestions }, (_, i) => ({
      id: i + 1,
      question: `Sample multiple-choice question ${i + 1} based on the text: "${textPreview}"`,
      options: [
        "A) Sample option 1",
        "B) Sample option 2",
        "C) Sample option 3",
        "D) Sample option 4",
      ],
      correctAnswer: "A",
      explanation:
        "This is a mock question. Replace with actual AI-generated content.",
      difficulty: difficulty,
      type: questionType,
    })),

    "true-false": Array.from({ length: numQuestions }, (_, i) => ({
      id: i + 1,
      question: `Sample true/false statement ${i + 1} based on the text`,
      correctAnswer: i % 2 === 0,
      explanation:
        "This is a mock question. Replace with actual AI-generated content.",
      difficulty: difficulty,
      type: questionType,
    })),

    "short-answer": Array.from({ length: numQuestions }, (_, i) => ({
      id: i + 1,
      question: `Sample short-answer question ${i + 1} based on the text?`,
      sampleAnswer:
        "This is a sample answer that demonstrates the expected response.",
      keyPoints: ["Key point 1", "Key point 2", "Key point 3"],
      difficulty: difficulty,
      type: questionType,
    })),

    essay: Array.from({ length: numQuestions }, (_, i) => ({
      id: i + 1,
      question: `Sample essay prompt ${i + 1}: Analyze and discuss the main concepts presented in the text.`,
      guidelines:
        "A good response should include: main themes, supporting evidence, and critical analysis.",
      suggestedLength: "500-750 words",
      difficulty: difficulty,
      type: questionType,
    })),
  };

  return mockQuestions[questionType] || mockQuestions["multiple-choice"];
}

/**
 * Validate question generation options
 *
 * @param {Object} options - Options to validate
 * @returns {boolean} - True if valid
 * @throws {Error} - If options are invalid
 */
export function validateQuestionOptions(options) {
  const validTypes = ["multiple-choice", "true-false", "short-answer", "essay"];
  const validDifficulties = ["easy", "medium", "hard"];

  if (options.questionType && !validTypes.includes(options.questionType)) {
    throw new Error(
      `Invalid question type. Must be one of: ${validTypes.join(", ")}`,
    );
  }

  if (options.difficulty && !validDifficulties.includes(options.difficulty)) {
    throw new Error(
      `Invalid difficulty. Must be one of: ${validDifficulties.join(", ")}`,
    );
  }

  if (
    options.numQuestions &&
    (options.numQuestions < 1 || options.numQuestions > 50)
  ) {
    throw new Error("Number of questions must be between 1 and 50");
  }

  return true;
}
