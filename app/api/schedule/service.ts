import { OpenAIModel } from "@/api/modelEntry";
import { loadModel } from "@/utils/modelLoader";
import { v4 } from "uuid";

export interface ScheduleReminderLLMResult {
    answer: string[];
    tokenUsage: {
      completionTokens: number;
      promptToken: number;
      totalTokens: number;
    };
  }
const model = loadModel({ type: process.env.MODEL_TYPE as any }) as OpenAIModel;
export const scheduleReminder = async (
    q: string,
  ): Promise<ScheduleReminderLLMResult> => {
    if (!model) throw Error("No model is available");
    const sessionKey = v4();
    console.log("User: " + q);
    const { answer, tokenUsage } =
      await model.promptSameSession<ScheduleReminderLLMResult>(q, sessionKey);
    console.log("AI: ", answer);
    return { answer, tokenUsage };
  };