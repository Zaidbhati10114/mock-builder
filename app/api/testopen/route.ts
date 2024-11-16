import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { prompt } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Dynamically format the prompt based on the content
        const dynamicPrompt = formatPromptForQuery(prompt);

        const result = await model.generateContent(dynamicPrompt);
        const response = await result.response;
        const text = await response.text();

        // Log the raw response for debugging purposes
        console.log('Raw response from AI:', text);

        // Clean up the AI response to ensure it's valid JSON
        const cleanedText = cleanResponse(text);

        // Try parsing the cleaned response
        try {
            const parsedData = JSON.parse(cleanedText);

            // Validate that the response is in the correct format
            if (!Array.isArray(parsedData)) {
                throw new Error('Invalid data structure: Expected an array.');
            }

            // Optionally, validate each item to ensure required fields exist
            parsedData.forEach((item, index) => {
                if (!item.id || !item.name) {
                    throw new Error(`Invalid data structure: Missing 'id' or 'name' at index ${index}`);
                }
            });

            return NextResponse.json(parsedData);

        } catch (e) {
            console.error('Failed to parse or validate JSON:', e);
            return NextResponse.json(
                { error: 'Failed to generate valid JSON data: Invalid structure or missing fields.' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Failed to generate content:', error);
        return NextResponse.json(
            { error: 'Failed to generate content' },
            { status: 500 }
        );
    }
}

// Function to dynamically create the prompt based on the user's request
function formatPromptForQuery(prompt: string): string {
    return `
    Based on the user's request, generate a JSON array of relevant items.
    The array must have at least 3 items and contain the following fields:
    - id: A unique identifier (numeric or string)
    - name: The name or description of the item
    - additional info: Provide additional information related to the item (if applicable)

    Here is the user request: "${prompt}"

    Ensure that the response:
    1. Is a valid JSON array
    2. Each item in the array contains the 'id', 'name', and 'additional info' fields
    3. The content is relevant to the user's request
    4. No additional text or irrelevant content should be included in the response
  `;
}

// Function to clean up AI response text
function cleanResponse(text: string): string {
    // Remove markdown code fences and trim whitespace
    return text.replace(/```json|```/g, '').trim();
}
