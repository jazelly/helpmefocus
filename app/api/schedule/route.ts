import { NextRequest, NextResponse } from "next/server";

import {
  LlamaModel,
  LlamaContext,
  LlamaChatSession,
  LlamaJsonSchemaGrammar,
} from "node-llama-cpp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import type { SchedulePayload } from "@/types/schedule";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_DIR = path.join(__dirname, "../../../models");

const loadGGUFModels = (baseDir: string) => {
  const results: Record<string, string> = {};

  const findGGUFModels = (dir: string) => {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      file = path.resolve(dir, file);
      const stat = fs.statSync(file);

      if (stat && stat.isDirectory()) {
        // Recursively search subdirectories
        findGGUFModels(file);
      } else {
        if (file.endsWith(".gguf")) {
          results[path.basename(file)] = file;
        }
      }
    });
  };

  findGGUFModels(baseDir);

  return results;
};

const ggufModels = loadGGUFModels(MODEL_DIR);
const theModel = Object.entries(ggufModels)[0][1];
const model = new LlamaModel({
  modelPath: theModel,
});

const toneMap: Record<number, string> = {
  1: "gentle and positive",
  2: "gentle",
  3: "neutral",
  4: "strcit",
  5: "harsh, strict, pushing, and negative",
};

const scheduleReminder = async ({
  prompt,
  intervalMinutes,
  totalMinutes,
  toneLevel,
}: SchedulePayload) => {
  const gg = new LlamaJsonSchemaGrammar({
    type: "object",
    properties: {
      remindMessages: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
  });
  const context = new LlamaContext({ model });
  const session = new LlamaChatSession({ context });
  const q0 = `I need a helpful assistant to remind me about progress for every ${intervalMinutes} minutes while I am focusing on one single task, so that I am not distracted. I need a list of messages to remind me. Can you give me those messages together in a list?`;
  const a0 = await session.prompt(q0, {
    maxTokens: context.getContextSize(),
  });
  console.log("AI: ", a0);

  const q1Suffix = `Make sure your tone be ${toneMap[toneLevel]}`;
  const q1 = `1. ${prompt}\n2. I will work for ${totalMinutes} minutes. You should remind me every ${intervalMinutes} minutes, so that is ${Math.floor(
    totalMinutes / intervalMinutes
  )} remindMessages in total\n${q1Suffix}`;
  console.log("User: " + q1);
  const a1 = await session.prompt(q1, {
    grammar: gg,
  });
  console.log("AI: " + a1);

  return a1;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { prompt, totalMinutes, intervalMinutes, toneLevel } = body;

    const remindList = await scheduleReminder(body);
    return NextResponse.json({ remindMessages: remindList }, { status: 200 });
  } catch (err) {
    return handleErrorResponse(err);
  }
}

function handleErrorResponse(error: any): NextResponse {
  if (error.response) {
    console.error(error.response.status, error.response.data);
    return NextResponse.json({ error: error.response.data }, { status: 500 });
  } else {
    console.error(`Error with OpenAI API request: ${error.message}`);
    return NextResponse.json(
      { error: "An error occurred during your request." },
      { status: 500 }
    );
  }
}
