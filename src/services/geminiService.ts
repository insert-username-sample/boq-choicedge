import { BOQItem } from '../types/boqTypes';

const GEMINI_API_KEY = "AIzaSyDPwgfgz8o76d249GpXh6G-uDzdv1qpG_s";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Converts an image file to a base64 string
 */
const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Processes images using Google Gemini API to extract BOQ data
 */
export const processImagesWithGemini = async (images: File[]): Promise<string> => {
  try {
    if (!images || images.length === 0) {
      throw new Error('No images provided for processing');
    }

    // Check image sizes and formats
    for (const image of images) {
      if (image.size > 20 * 1024 * 1024) { // 20MB limit
        throw new Error(`Image ${image.name} exceeds size limit (20MB)`);
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(image.type)) {
        throw new Error(`Image ${image.name} has unsupported format. Please use JPEG or PNG.`);
      }
    }

    // Convert all images to base64
    const base64Images = await Promise.all(images.map(image => imageToBase64(image)));
    
    // Prepare the request payload
    const payload = {
      contents: [
        {
          parts: [
            {
              text: "Extract all the information from this handwritten Bill of Quantities (BOQ). Format the response as a structured JSON with the following fields: projectDetails (containing clientName, projectName, location, projectType, carpetArea), and items (array of BOQ items with description, specifications, materials, unit, quantity, rate, amount). Ensure all numeric values are properly extracted."
            },
            ...base64Images.map(base64 => ({
              inline_data: {
                mime_type: "image/jpeg",
                data: base64
              }
            }))
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096
      }
    };

    // Make the API request
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error response:', errorData);
        
        // Extract specific error information if available
        const errorMessage = errorData.error?.message || 'Unknown API error';
        const errorCode = errorData.error?.code || 'UNKNOWN';
        
        if (errorCode === 'PERMISSION_DENIED') {
          throw new Error('API key error: Please check your Gemini API key configuration');
        } else if (errorCode === 'RESOURCE_EXHAUSTED') {
          throw new Error('API quota exceeded: The application has reached its usage limit');
        } else {
          throw new Error(`Gemini API error (${errorCode}): ${errorMessage}`);
        }
      }

      const data = await response.json() as GeminiResponse;
      
      // Validate response structure
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Gemini API returned an empty response');
      }
      
      // Extract the text response from Gemini
      const extractedText = data.candidates[0]?.content?.parts[0]?.text || '';
      
      if (!extractedText) {
        throw new Error('Gemini API returned an empty text response');
      }
      
      return extractedText;
    } catch (fetchError) {
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        throw new Error('Network error: Please check your internet connection');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error processing images with Gemini:', error);
    throw error;
  }
};

/**
 * Parses the Gemini API response text into structured BOQ data
 */
export const parseGeminiResponse = (responseText: string): {
  projectDetails: any;
  items: BOQItem[];
} => {
  try {
    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response received from Gemini API');
    }

    // Try to parse the response as JSON
    let parsedData;
    try {
      // First attempt: try to parse the entire response as JSON
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.log('First JSON parse attempt failed, trying to extract JSON from text');
      
      // Second attempt: try to extract JSON from text (in case there's additional text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
        } catch (innerError) {
          console.error('Failed to parse extracted JSON:', innerError);
          throw new Error('Could not parse extracted JSON from response');
        }
      } else {
        // Third attempt: Look for code blocks that might contain JSON
        const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          try {
            parsedData = JSON.parse(codeBlockMatch[1].trim());
          } catch (codeBlockError) {
            console.error('Failed to parse JSON from code block:', codeBlockError);
            throw new Error('Could not parse JSON from code block in response');
          }
        } else {
          console.error('No valid JSON structure found in response');
          throw new Error('Could not extract JSON from response');
        }
      }
    }

    // Log the parsed data for debugging
    console.log('Parsed data structure:', JSON.stringify(parsedData, null, 2));

    // Ensure the parsed data has the expected structure
    if (!parsedData.projectDetails) {
      console.error('Missing projectDetails in parsed data');
      throw new Error('Invalid response format: missing projectDetails');
    }
    
    if (!Array.isArray(parsedData.items)) {
      console.error('Missing or invalid items array in parsed data');
      throw new Error('Invalid response format: missing or invalid items array');
    }

    // Process the items to ensure numeric values are properly formatted
    const processedItems = parsedData.items.map((item: any, index: number) => {
      // Log each item for debugging
      console.log(`Processing item ${index}:`, item);
      
      return {
        id: index + 1,
        description: item.description || '',
        specifications: item.specifications || '',
        materials: item.materials || '',
        unit: item.unit || '',
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
        amount: parseFloat(item.amount) || parseFloat(item.quantity) * parseFloat(item.rate) || 0
      };
    });

    return {
      projectDetails: parsedData.projectDetails,
      items: processedItems
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    // Check if error is an instance of Error to safely access message
    if (error instanceof Error) {
      throw new Error(`Failed to parse Gemini response: ${error.message}`);
    } else {
      // Handle cases where error is not an Error object
      throw new Error(`Failed to parse Gemini response: ${String(error)}`);
    }
  }
};
