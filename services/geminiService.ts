import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData, Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Analyze receipt image and extract data
export const scanReceipt = async (base64Image: string): Promise<ReceiptData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image
          }
        },
        {
          text: `Analyze this receipt. Extract the total amount, the date (ISO format YYYY-MM-DD), the merchant name as 'title', and guess the best category from this list: Food, Transport, Shopping, Bills, Entertainment, Health, Education, Others. Return JSON.`
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            title: { type: Type.STRING },
            category: { 
              type: Type.STRING, 
              enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Others'] 
            },
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ReceiptData;
    }
    return {};
  } catch (error) {
    console.error("Gemini Receipt Scan Error:", error);
    throw error;
  }
};

// Analyze spending habits
export const getSpendingInsights = async (transactions: Transaction[]): Promise<string> => {
  try {
    // Filter only expenses for insights
    const expenses = transactions.filter(t => t.type === 'expense');

    // Limit to last 50 expenses to save context/tokens
    const recentExpenses = expenses.slice(0, 50).map(e => ({
      date: e.date,
      title: e.title,
      amount: e.amount,
      category: e.category
    }));

    if (recentExpenses.length === 0) {
      return "Add some expenses to get AI-powered insights!";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a financial advisor. Analyze these expenses: ${JSON.stringify(recentExpenses)}. 
      Provide 3 short, actionable bullet points about my spending habits. 
      Be friendly and encouraging. in less than 150 words  
      Format the output as a simple Markdown list.`
    });

    return response.text || "Could not generate insights at the moment.";
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return "Unable to connect to AI for insights.";
  }
};