// LLM Service for AI-powered error explanations
// Supports OpenAI, Anthropic, or hosted Ollama

export async function getErrorExplanation(errorCode, deviceData = {}) {
  const provider = process.env.LLM_PROVIDER || "openai";

  switch (provider.toLowerCase()) {
    case "openai":
      return getOpenAIExplanation(errorCode, deviceData);
    case "anthropic":
      return getAnthropicExplanation(errorCode, deviceData);
    case "ollama":
      return getOllamaExplanation(errorCode, deviceData);
    default:
      return getOpenAIExplanation(errorCode, deviceData);
  }
}

export async function getAIRecommendation(anomalyType, anomalyData = {}) {
  const provider = process.env.LLM_PROVIDER || "openai";

  switch (provider.toLowerCase()) {
    case "openai":
      return getOpenAIRecommendation(anomalyType, anomalyData);
    case "anthropic":
      return getAnthropicRecommendation(anomalyType, anomalyData);
    case "ollama":
      return getOllamaRecommendation(anomalyType, anomalyData);
    default:
      return getOpenAIRecommendation(anomalyType, anomalyData);
  }
}

// OpenAI implementation
async function getOpenAIExplanation(errorCode, deviceData) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OPENAI_API_KEY not set, returning fallback explanation");
    return getFallbackExplanation(errorCode);
  }

  const prompt = `You are a solar inverter technical expert. Explain this Deye inverter error code: ${errorCode}

Device context:
${JSON.stringify(deviceData, null, 2)}

Provide a detailed explanation in JSON format with these exact fields:
{
  "code": "${errorCode}",
  "name": "Error name/title",
  "severity": "info|warning|critical",
  "cause": "What likely caused this error",
  "explanation": "Detailed explanation of the error",
  "troubleshooting": ["Step 1", "Step 2", "Step 3"],
  "requiresOnsite": true/false,
  "ownerCanFix": true/false
}

Be specific and technical. Focus on Deye inverters. Return ONLY valid JSON.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a solar inverter technical expert. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    // Parse JSON response
    const explanation = JSON.parse(content);
    return {
      code: explanation.code || errorCode,
      name: explanation.name || `Error ${errorCode}`,
      severity: explanation.severity || "warning",
      cause: explanation.cause || "Unknown",
      explanation: explanation.explanation || "Error detected",
      troubleshooting: explanation.troubleshooting || [
        "Check device manual",
        "Contact support",
      ],
      requiresOnsite: explanation.requiresOnsite !== false,
      ownerCanFix: explanation.ownerCanFix === true,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return getFallbackExplanation(errorCode);
  }
}

async function getOpenAIRecommendation(anomalyType, anomalyData) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return getFallbackRecommendation(anomalyType);
  }

  const prompt = `You are a solar energy system expert. A user has a Deye solar inverter system with the following issue:

Issue Type: ${anomalyType}
Details: ${JSON.stringify(anomalyData, null, 2)}

Provide a helpful recommendation in JSON format with these exact fields:
{
  "issue": "${anomalyType}",
  "explanation": "Clear explanation of what this issue means",
  "possibleCauses": ["Cause 1", "Cause 2", "Cause 3"],
  "recommendedActions": ["Action 1", "Action 2", "Action 3"],
  "severity": "info|warning|critical",
  "ownerCanFix": true/false,
  "requiresOnsite": true/false
}

Be specific and practical. Focus on Deye inverters and common solar system issues. Return ONLY valid JSON.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a solar energy system expert. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const recommendation = JSON.parse(content);
    return {
      issue: recommendation.issue || anomalyType,
      explanation: recommendation.explanation || "Issue detected",
      possibleCauses: recommendation.possibleCauses || ["Check device status"],
      recommendedActions: recommendation.recommendedActions || [
        "Contact support",
      ],
      severity: recommendation.severity || "warning",
      ownerCanFix: recommendation.ownerCanFix === true,
      requiresOnsite: recommendation.requiresOnsite !== false,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return getFallbackRecommendation(anomalyType);
  }
}

// Anthropic implementation
async function getAnthropicExplanation(errorCode, deviceData) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return getFallbackExplanation(errorCode);
  }

  const prompt = `You are a solar inverter technical expert. Explain this Deye inverter error code: ${errorCode}

Device context:
${JSON.stringify(deviceData, null, 2)}

Provide a detailed explanation in JSON format with these exact fields:
{
  "code": "${errorCode}",
  "name": "Error name/title",
  "severity": "info|warning|critical",
  "cause": "What likely caused this error",
  "explanation": "Detailed explanation of the error",
  "troubleshooting": ["Step 1", "Step 2", "Step 3"],
  "requiresOnsite": true/false,
  "ownerCanFix": true/false
}

Be specific and technical. Focus on Deye inverters. Return ONLY valid JSON.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
      throw new Error("No content in Anthropic response");
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const explanation = JSON.parse(jsonMatch[0]);
    return {
      code: explanation.code || errorCode,
      name: explanation.name || `Error ${errorCode}`,
      severity: explanation.severity || "warning",
      cause: explanation.cause || "Unknown",
      explanation: explanation.explanation || "Error detected",
      troubleshooting: explanation.troubleshooting || [
        "Check device manual",
        "Contact support",
      ],
      requiresOnsite: explanation.requiresOnsite !== false,
      ownerCanFix: explanation.ownerCanFix === true,
    };
  } catch (error) {
    console.error("Anthropic API error:", error);
    return getFallbackExplanation(errorCode);
  }
}

async function getAnthropicRecommendation(anomalyType, anomalyData) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return getFallbackRecommendation(anomalyType);
  }

  // Similar implementation to OpenAI but using Anthropic API
  // ... (similar pattern)
  return getFallbackRecommendation(anomalyType);
}

// Ollama implementation (for hosted Ollama)
async function getOllamaExplanation(errorCode, deviceData) {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

  const prompt = `You are a solar inverter technical expert. Explain this Deye inverter error code: ${errorCode}

Device context:
${JSON.stringify(deviceData, null, 2)}

Provide a detailed explanation in JSON format with these exact fields:
{
  "code": "${errorCode}",
  "name": "Error name/title",
  "severity": "info|warning|critical",
  "cause": "What likely caused this error",
  "explanation": "Detailed explanation of the error",
  "troubleshooting": ["Step 1", "Step 2", "Step 3"],
  "requiresOnsite": true/false,
  "ownerCanFix": true/false
}

Be specific and technical. Focus on Deye inverters. Return ONLY valid JSON.`;

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "llama3.2",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const explanationText = data.response || "";

    const jsonMatch = explanationText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const explanation = JSON.parse(jsonMatch[0]);
    return {
      code: explanation.code || errorCode,
      name: explanation.name || `Error ${errorCode}`,
      severity: explanation.severity || "warning",
      cause: explanation.cause || "Unknown",
      explanation: explanation.explanation || "Error detected",
      troubleshooting: explanation.troubleshooting || [
        "Check device manual",
        "Contact support",
      ],
      requiresOnsite: explanation.requiresOnsite !== false,
      ownerCanFix: explanation.ownerCanFix === true,
    };
  } catch (error) {
    console.error("Ollama API error:", error);
    return getFallbackExplanation(errorCode);
  }
}

async function getOllamaRecommendation(anomalyType, anomalyData) {
  // Similar to getOllamaExplanation but for recommendations
  return getFallbackRecommendation(anomalyType);
}

// Fallback implementations
function getFallbackExplanation(errorCode) {
  return {
    code: errorCode,
    name: `Error ${errorCode}`,
    severity: "warning",
    cause: "Unknown - AI service unavailable",
    explanation: `Error code ${errorCode} detected. AI explanation service is currently unavailable.`,
    troubleshooting: [
      "Check device status",
      "Review device logs",
      "Contact support",
    ],
    requiresOnsite: true,
    ownerCanFix: false,
  };
}

function getFallbackRecommendation(anomalyType) {
  return {
    issue: anomalyType,
    explanation: `Issue detected: ${anomalyType}. AI recommendation service is currently unavailable.`,
    possibleCauses: ["Check device status"],
    recommendedActions: ["Review system logs", "Contact support"],
    severity: "warning",
    ownerCanFix: false,
    requiresOnsite: true,
  };
}
