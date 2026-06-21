// Initialize the Google Gen AI SDK dynamically because it is an ES Module
let ai: any = null;
const getAI = async () => {
  if (!ai) {
    const { GoogleGenAI } = await import('@google/genai');
    ai = new GoogleGenAI({});
  }
  return ai;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateItinerary = async (
  destination: string,
  durationDays: number,
  budgetTier: string,
  interests: string[],
  retries = 3
): Promise<any> => {
  const prompt = `
    You are an expert travel planner. Create a ${durationDays}-day itinerary for a trip to ${destination}.
    The budget tier is ${budgetTier}. The traveler is interested in: ${interests.join(', ')}.
    Include daily activities, 3 hotel suggestions (budget, mid-range, luxury), estimated budget breakdown, and a weather-aware packing list based on the destination's current season.
    Provide the response strictly in JSON format matching the schema below.
  `;

  // We are using responseSchema feature to ensure structured JSON output
  try {
    const aiInstance = await getAI();
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "object",
          properties: {
            itinerary: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  dayNumber: { type: "integer" },
                  activities: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        estimatedCostUSD: { type: "number" },
                        timeOfDay: { type: "string" }
                      },
                      required: ["title", "description", "estimatedCostUSD", "timeOfDay"]
                    }
                  }
                },
                required: ["dayNumber", "activities"]
              }
            },
            hotels: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  rating: { type: "number" },
                  pricePerNight: { type: "number" },
                  description: { type: "string" },
                  tier: { type: "string" }
                },
                required: ["name", "rating", "pricePerNight", "description", "tier"]
              }
            },
            estimatedBudget: {
              type: "object",
              properties: {
                flights: { type: "number" },
                accommodation: { type: "number" },
                food: { type: "number" },
                activities: { type: "number" },
                localTransport: { type: "number" },
                totalCost: { type: "number" }
              },
              required: ["flights", "accommodation", "food", "activities", "localTransport", "totalCost"]
            },
            packingList: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  reason: { type: "string" },
                  packed: { type: "boolean" }
                },
                required: ["item", "reason", "packed"]
              }
            }
          },
          required: ["itinerary", "hotels", "estimatedBudget", "packingList"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error('Empty response from AI');
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.status === 503)) {
      // Exponential backoff for rate limits or service unavailability
      const backoffTime = Math.pow(2, 4 - retries) * 1000;
      console.log(`Rate limit hit, retrying in ${backoffTime}ms...`);
      await delay(backoffTime);
      return generateItinerary(destination, durationDays, budgetTier, interests, retries - 1);
    }
    throw error;
  }
};

export const regenerateDayAI = async (
  destination: string,
  dayNumber: number,
  promptOverride: string,
  retries = 3
): Promise<any> => {
  const prompt = `
    You are an expert travel planner. Regenerate Day ${dayNumber} for a trip to ${destination}.
    The user explicitly requested: "${promptOverride}".
    Provide the response strictly in JSON format matching the schema below.
  `;

  try {
    const aiInstance = await getAI();
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "object",
          properties: {
            dayNumber: { type: "integer" },
            activities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  estimatedCostUSD: { type: "number" },
                  timeOfDay: { type: "string" }
                },
                required: ["title", "description", "estimatedCostUSD", "timeOfDay"]
              }
            }
          },
          required: ["dayNumber", "activities"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error('Empty response from AI');
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.status === 503)) {
      const backoffTime = Math.pow(2, 4 - retries) * 1000;
      await delay(backoffTime);
      return regenerateDayAI(destination, dayNumber, promptOverride, retries - 1);
    }
    throw error;
  }
};
