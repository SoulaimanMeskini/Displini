import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ParsedCommand {
  type: "meal" | "workout" | "medication" | "task" | "calendar" | "unknown";
  data?: {
    name?: string;
    emoji?: string;
    protein?: number;
    carbs?: number;
    fat?: number;
    duration?: number;
    workoutType?: string;
    time?: string;
    date?: string;
    frequency?: string;
    days?: string[];
  };
  message?: string;
}

export async function parseUserCommand(userInput: string): Promise<ParsedCommand> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a health and fitness assistant. Parse user commands into structured data for logging meals, workouts, medications, tasks, or calendar events.

Respond with JSON in this exact format:
{
  "type": "meal" | "workout" | "medication" | "task" | "calendar" | "unknown",
  "data": {
    "name": "string (item name)",
    "emoji": "string (appropriate emoji)",
    "protein": number (grams, for meals),
    "carbs": number (grams, for meals),
    "fat": number (grams, for meals),
    "duration": number (minutes, for workouts),
    "workoutType": "cardio" | "strength" | "flexibility" | "sports" (for workouts),
    "time": "HH:MM" (24-hour format),
    "date": "YYYY-MM-DD" (if specified, otherwise today),
    "frequency": "daily" | "weekly" | "biweekly" (for recurring items),
    "days": ["monday", "tuesday", ...] (for weekly items)
  },
  "message": "string (confirmation message to show user)"
}

Examples:
- "log chicken salad for lunch" → type: "meal", name: "Chicken Salad", emoji: "🥗", protein: 35, carbs: 20, fat: 15, time: "12:30"
- "schedule a 30 min run tomorrow at 6am" → type: "workout", name: "Morning Run", emoji: "🏃", duration: 30, workoutType: "cardio", time: "06:00", date: tomorrow's date
- "remind me to take vitamins every morning" → type: "medication", name: "Vitamins", emoji: "💊", time: "08:00", frequency: "daily"
- "add task to review project docs" → type: "task", name: "Review project docs", emoji: "📝"

Make reasonable estimates for nutrition if not specified. Use context clues for meal times (breakfast ~8am, lunch ~12:30pm, dinner ~7pm).`,
        },
        {
          role: "user",
          content: userInput,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as ParsedCommand;
  } catch (error: any) {
    console.error("OpenAI parsing error:", error);
    
    if (error?.status === 429 || error?.code === "insufficient_quota") {
      return {
        type: "unknown",
        message: "AI service temporarily unavailable due to rate limits. Please use manual entry or try again later."
      };
    }
    
    return {
      type: "unknown",
      message: "Sorry, I couldn't understand that. Try being more specific, like 'log chicken salad for lunch' or 'schedule a 30 min run tomorrow'."
    };
  }
}
