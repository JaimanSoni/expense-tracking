import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// Define interface for allowed response (text-only response)
interface GeminiResponse {
  amount: string;
  category: string;
  description: string;
  date: string;
  time: string;
  payment_mode: string;
  payment_type: string;
}

export default class Gemini {
  private static instance: Gemini;
  private aiClient: GoogleGenerativeAI;
  private model: GenerativeModel;

  private constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error("API key is required to initialize Gemini.");
    }

    this.aiClient = new GoogleGenerativeAI(apiKey);
    this.model = this.aiClient.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
  }

  // Singleton initializer
  static init(apiKey: string): Gemini {
    if (!Gemini.instance) {
      Gemini.instance = new Gemini(apiKey);
    }
    return Gemini.instance;
  }

  // Main function to process user input and return JSON string
  async processInput(input: string): Promise<string> {
    const prompt = `
You are a text-to-JSON parser. You must ONLY return a valid JSON string that strictly follows the schema given below — nothing else.
My name is Jaiman Soni.
---

## 🎯 Task:
You will be given a sentence that contains information about:
- an expense (amount)
- its category
- payment mode
- and possibly date and time

Parse this sentence into the following JSON format. Use default values only when not provided in the text.

---

## 🧾 JSON Format (Output ONLY this structure):

{
  "amount": "",                          
  "category": "",                        
  "description": "",                     
  "date": "",                            
  "time": "",                            
  "payment_mode": "",                    
  "payment_type": "",
  "bank": "",                
}

---

## ✅ Allowed Category Options For Debit:
["Travel", "Food", "Party", "Party with Family", "Party with Friends", "Productive", "Short Trip", "Long Trip", "Exam", "Fees", "Miscelleneous", "Lunch", "Dinner"]

## ✅ Allowed Category Options For Credit:
["Salary", "Music", "Relative", "Extra Work", "Freelancing", "Trading"]

---

## 🧠 Rules:
1. Do not guess. If a field is not provided, leave it as an empty string ("") unless a default is allowed.
2. The "description" must be 20 words or fewer.
3. Do not include any explanation or commentary. Output only the JSON object.
4. Only use a category from the allowed list. Choose the most appropriate one if more than one fits.
5. Do not change key names or structure.
6. "payment_mode" defaults to "UPI" unless otherwise stated.
7. "payment_type" defaults to "debit" unless the word "credit" is used. You can also logically predict this from the sentence given below. For example: travel is always going to be debit. Salary to me is always credit, but salary given to someone else is debit etc...
8. ABSOLUTELY DO NOT include any markdown, \`\`\`json, backticks, quotes, or explanation.
9. Return ONLY the JSON object. No intro, no outro, no comments, no special characters, no key renaming.\
10. Auto correct some of the mistakes in making the descrition.
11. Date format should be Date Month Year, for eg 4 August, 2025.
12. THe default value of bank should be SBI. If mentioned used DCB or Axis whichever is mentioned.


---

## Actual User Input To Be Processed:
${input}

---

Only return a pure, correctly formatted JSON object like above — no markdown, no code blocks, no extra text, no extra quotes, no special characters.
`;

    const result = await this.model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const rawText = response.text().trim();

    try {
      // Parse and format it
      const jsonObject = JSON.parse(rawText);
      return JSON.stringify(jsonObject, null, 2); // formatted JSON string
    } catch (err) {
      console.error("Failed to parse response as JSON:", err);
      return rawText; // Fallback to raw response
    }
  }
}
