import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt, selectedText, preset, fullContent } = await request.json();

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Get OpenRouter API key from environment
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    // Configure the model - you can change this to your preferred model
    const model = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";

    // Build the system prompt based on preset and context
    let systemPrompt =
      `You are a helpful AI assistant that generates HTML content. IMPORTANT: Please format your response using proper HTML syntax that is compatible. Use the following HTML elements for styling: 
- <h1>, <h2>, <h3> for headings
- <p> for paragraphs
- <strong> for bold text
- <em> for italic text
- <ul> and <li> for bullet points
- <ol> and <li> for numbered lists
- <blockquote> for quotes
- <br> for line breaks when needed
-and others if needed.

Ensure the HTML is well-structured and beautifully styled. 

IMPORTANT: Please do not add other words except the output HTML content. Strictly Do not include any additional explanations or text outside of the HTML tags. ONLY the expected output`;

    if (preset) {
      systemPrompt += ` Current preset: ${preset}.`;
    }

    if (selectedText) {
      systemPrompt += ` The user has selected this text: "${selectedText}". Focus on improving or working with this selection.`;
    }

    // Prepare the messages for OpenRouter
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: fullContent
          ? `User request: ${prompt}`
          : prompt,
      },
    ];

    // Make request to OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "AI Content Generator",
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 4000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error:", errorData);

      return NextResponse.json(
        {
          error: `OpenRouter API error: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract the generated content
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      return NextResponse.json(
        { error: "No content generated from AI service" },
        { status: 500 }
      );
    }

    // Return the generated content
    return NextResponse.json({
      content: generatedContent,
      model: model,
      usage: data.usage, 
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for health check
export async function GET() {
  return NextResponse.json({
    status: "OpenRouter AI API is running",
    timestamp: new Date().toISOString(),
  });
}
