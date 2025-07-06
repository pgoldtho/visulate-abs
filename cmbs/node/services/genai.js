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
      investor's decision-making process. When analyzing the data, look for any discrepancies in the
      supplied values. Pay less attention to missing or null values.

      Format your response for readability. Add commas to large numbers and add a currency symbol where
      appropriate (e.g. "$4,522,793" instead  of "4522793"). Convert percentages expressed as decimal
      values to percentages (e.g., 0.05 to 5%).

      When referring to values supplied in JSON format, avoid making references to the JSON document or its keys.
      Instead, use natural language descriptions. For example, instead of "scheduled_principal_amount",
      refer to the "scheduled principal amount" or "scheduled principal".
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

    // The LLM sometimes indents an entire markdown response, which causes `marked`
    // to wrap it in a <pre><code> block instead of parsing the markdown within it.
    // This can happen to the whole response or just parts of it, often after an
    // unindented introductory sentence.
    // The following logic splits the response into blocks separated by blank lines,
    // dedents each block individually, and then rejoins them. This preserves
    // formatting for unindented paragraphs while correctly parsing indented
    // markdown lists and other elements.
    const dedent = (textBlock) => {
      const lines = textBlock.split('\n');
      const nonEmptyLines = lines.filter(line => line.trim().length > 0);
      if (nonEmptyLines.length === 0) {
        return textBlock;
      }
      const minIndent = Math.min(
        ...nonEmptyLines.map(line => (line.match(/^\s*/) || [''])[0].length)
      );
      if (minIndent > 0) {
        return lines.map(line => line.substring(minIndent)).join('\n');
      }
      return textBlock;
    };

    // Split by two or more newlines to handle paragraph breaks, dedent each part, and rejoin.
    const unindentedText = textResponse.split(/\n{2,}/).map(dedent).join('\n\n');
    return marked.parse(unindentedText);
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    throw new Error(`Failed to communicate with Gemini: ${error.message}`);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
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
async function termSheetSummary(document, apiKey, req) {
  // Reset the session when this function is called
  resetSession(req);

  let response = `<a href="${document.url}" target="_blank">Original Term Sheet filed on ${formatDate(document.filing_date)}</a><br>`;

  let prompt = `
    Summarize the following CMBS term sheet dated ${document.filing_date}:

    ${document.prospectus_text}

    Provide a concise summary of the key points of the term sheet,
    focusing on the loan characteristics, deal structure, and underlying properties.`;

  response += await sendToLLM(req, prompt, apiKey);

  return response;
}

async function assetsAnalysis(assets, apiKey, req) {
  let response = `Analysis from the <a href="${assets[0].url}" target="_blank">latest EXH 102 for this offering filed on ${formatDate(assets[0].filing_date)}</a><br>`;
  let prompt = `
    The following document dated ${assets[0].filing_date} has the latest EXH 102 data for the loan assets.
    Each asset has been assigned an asset number. This will be an integer value for Single-Asset/Single-Borrower loans.
    Multi-Asset/Multi-Borrower (MABA) loans will have an integer value for the asset with sub values for the individual properties.
    For example MAMB loan 3 could have properties 3.01, 3.02, 3.03, or 3-001, 3-002, 3-003 .. etc. Some of the values for these assets
    are rolled up to the parent asset e.g 3 and not repeated for the sub assets.

    Note the filing date of EXH 102 and compared to the term sheet. Compare the "securitization" values to the
    "current" ones. Highlight any with significant differences. Also lookout for
    suspicious values like values that remain unchanged over an extended period of time. Compare the
    performance of the assets to any assumptions made in the term sheet. Here is the asset data:

    ${JSON.stringify(assets)}


    ANALYZE THE DATA IN THE EXH 102 DOCUMENT NOT THE DOCUMENT ITSELF
    and don't forget to format large numbers for readability.`;



  response += await sendToLLM(req, prompt, apiKey);
  return response;
}


async function collateralAnalysis(collateral, apiKey, req) {
  resetSession(req);
  let prompt = `
    The following document dated ${collateral[0].filing_date} has the latest EXH 102 data for the properties used as collateral
    For the loans. Note that the asset numbers in this document correspond to the asset numbers in the assets document.

    Review the financial performance of these properties looking properties that are underperforming or performing better than expected.
    Compare the "securitization" values to the "current" ones. Highlight any with significant differences. Compare the
    performance of the assets to the underwriting assumptions. Note the filing date of EXH 102 and compared to the term sheet.
    Here is the collateral data:

    ${JSON.stringify(collateral)}

    ANALYZE THE DATA IN THE EXH 102 DOCUMENT NOT THE DOCUMENT ITSELF.`;

  let response = await sendToLLM(req, prompt, apiKey);
  return response;
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

module.exports = { termSheetSummary, collateralAnalysis, assetsAnalysis, chat };
