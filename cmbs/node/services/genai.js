const { GoogleGenerativeAI } = require("@google/generative-ai");
const marked = require("marked");

/**
 * resetSession
 *
 * Resets the chat session for a given sessionId
 *
 * @param {object} req - the request object.
 *
 */
function resetSession(req) {
  req.session.history = [];
}

/**
 * sendToLLM
 *
 * Sends a prompt or question to the LLM and returns the response.
 *
 * @param {object} req - The request object.
 * @param {string} message - The prompt or question.
 * @param {string} apiKey - Your Google AI API key.
 * @returns {Promise<string>} - The LLM's response.
 * @throws {Error} - If there is an error communicating with the LLM.
 */
async function sendToLLM(req, message, apiKey) {
  try {
    if (!apiKey) {
      throw new Error("API key is required to use the Gemini API.");
    }
    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);

    const systemInstructions = `
      You are a financial analyst at a large investment bank specializing in asset-backed securities.
      Your have asked you to summarize the key points of a CMBS prospectus for an institutional investor
      who is considering investing in the deal. The prospectus is a large document with detailed
      information about the underlying properties, loan characteristics, and deal structure. Your task is
      to distill this information into a clear and concise summary.

      Avoid using conversational language. Focus on the key facts and figures that are relevant to the
      investor's decision-making process.
    `;

    // Get the history from the session
    const history = req.session.history || [];


    // Initialize the model, pass history
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemInstructions
    });
    // Prepare the chat history and content
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 8192, // Adjust as needed
        temperature: 0.8, // Adjust as needed
        topP: 1,
      },
    });

    // Send the message to the LLM
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const textResponse = await response.text();

    // Update the history with the user and model turns
    req.session.history.push({ role: "user", parts: [{text: message}] });
    req.session.history.push({ role: "model", parts: [{text: textResponse}] });

    return marked.parse(textResponse);
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    throw new Error(`Failed to communicate with Gemini: ${error.message}`);
  }
}

/**
 * documentSummary
 *
 * Analyzes a large text document returns the results as HTML.
 *
 * @param {string} document - The text of the document to analyze.
 * @param {string} apiKey - Your Google AI API key.
 * @param {object} req - the request object.
 * @returns {Promise<string>} - The analysis results as HTML.
 * @throws {Error} - If there is an error communicating with the Gemini API.
 */
async function documentSummary(document, apiKey, req) {
  // Reset the session when this function is called
  resetSession(req);

  const prompt = `
    Summarize the following CMBS term sheet:
    ${document}`;

  return await sendToLLM(req, prompt, apiKey);
}

/**
 * chat
 *
 * Handles follow-up questions and maintains conversation history.
 *
 * @param {string} question - The follow-up question.
 * @param {string} apiKey - Your Google AI API key.
 * @param {object} req - the request object.
 * @returns {Promise<string>} - The chat response as HTML.
 * @throws {Error} - If there is an error communicating with the Gemini API.
 */
async function chat(question, apiKey, req) {
  return await sendToLLM(req, question, apiKey);
}

module.exports = { documentSummary, chat };
