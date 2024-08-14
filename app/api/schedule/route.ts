import { NextRequest, NextResponse } from "next/server";
import type { SchedulePayload } from "@/types/schedule";
import { loadModel } from "@/utils/modelLoader";
import { v4 } from "uuid";

const toneMap: Record<number, string> = {
  1: "gentle and positive",
  2: "gentle",
  3: "neutral",
  4: "strcit",
  5: "harsh, strict, pushing, and negative",
};

const isLocal = process.env.ENV === "development";
const model = loadModel({ type: isLocal ? "gguf" : "openai" });

const jsonFormatInstruction = `
You must format your output as a JSON value that adheres to a given "JSON Schema" instance.

"JSON Schema" is a declarative language that allows you to annotate and validate JSON documents.

For example, the example "JSON Schema" instance {{"properties": {{"foo": {{"description": "a list of test words", "type": "array", "items": {{"type": "string"}}}}}}, "required": ["foo"]}}}}
would match an object with one required property, "foo". The "type" property specifies "foo" must be an "array", and the "description" property semantically describes it as "a list of test words". The items within "foo" must be strings.
Thus, the object {{"foo": ["bar", "baz"]}} is a well-formatted instance of this example "JSON Schema". The object {{"properties": {{"foo": ["bar", "baz"]}}}} is not well-formatted.

Your output will be parsed and type-checked according to the provided schema instance, so make sure all fields in your output match the schema exactly and there are no trailing commas!

Here is the JSON Schema instance your output must adhere to. Include the enclosing markdown codeblock:
\`\`\`json
{"type":"object","properties":{"answer":{"type":"string","description":"answer to the user's question"},"source":{"type":"string","description":"source used to answer the user's question, should be a website."}},"required":["answer","source"],"additionalProperties":false,"$schema":"http://json-schema.org/draft-07/schema#"}
\`\`\`
`;

const scheduleReminder = async ({
  prompt,
  intervalMinutes,
  totalMinutes,
  toneLevel,
}: SchedulePayload) => {
  if (!model) throw Error("No model is available");
  const sessionKey = v4();

  const q = `I need a helpful assistant to remind me about progress for every ${intervalMinutes} minutes 
  while I am focusing on one single task, so that I am not distracted. I need a list of messages to remind me. 
  Can you give me those messages together in a list?
  The task is ${prompt}.
  Make sure your tone be ${toneMap[toneLevel]}
  ${jsonFormatInstruction}`;
  console.log("User: " + q);
  const a = await model.promptSameSession(q, sessionKey);
  console.log("AI: ", a);
  return a;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
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
