import { NextRequest, NextResponse } from "next/server";
import type {
  ScheduleError,
  SchedulePayload,
  ScheduleResponse,
} from "@/types/schedule";
import { addUsage } from "@/orm/usage";
import { toneMap } from "@/utils/tone";
import { scheduleReminder } from "./service";

const jsonFormatInstruction = (outputInstruct: string) => `
You must format your output as a JSON value that adheres to a given "JSON Schema" instance.

"JSON Schema" is a declarative language that allows you to annotate and validate JSON documents.

For example, the example "JSON Schema" instance {{"properties": {{"messages": {{"description": "${outputInstruct}", "type": "array", "items": {{"type": "string"}}}}}}, "required": ["messages"]}}}}
would match an object with one required property, "messages". The "type" property specifies "messages" must be an "array", and the "description" property semantically describes it as "${outputInstruct}". The items within "foo" must be strings.
Thus, the object {{"messages": ["bar", "baz"]}} is a well-formatted instance of this example "JSON Schema". The object {{"properties": {{"messages": ["bar", "baz"]}}}} is not well-formatted.

Your output will be parsed and type-checked according to the provided schema instance, so make sure all fields in your output match the schema exactly and there are no trailing commas!

Here is the JSON Schema instance your output must adhere to. Include the enclosing markdown codeblock:
\`\`\`json
{"type":"object","properties":{"answer":{"type":"array","items": {"type": "string"},"description":"${outputInstruct}"},"required":["answer"],"additionalProperties":false,"$schema":"http://json-schema.org/draft-07/schema#"}
\`\`\`
`;

const getPrompt = ({
  prompt,
  intervalMinutes,
  totalMinutes,
  toneLevel,
}: SchedulePayload) => {
  return `I am doing something like ${prompt}. I aim to focus on it for ${totalMinutes} minutes.
  Your task is to give me an array of ${Math.ceil(totalMinutes / intervalMinutes)} messages as reminder list so that I can focus.
  The message is to be used for every ${intervalMinutes} minutes as a reminder.
  That is, you must give me ${Math.ceil(totalMinutes / intervalMinutes)} messages.  
  Your tone must be ${toneMap[toneLevel]}, so that it can push me.
  ${jsonFormatInstruction("an array of ${Math.ceil(totalMinutes/intervalMinutes)} messages")}`;
};

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ScheduleResponse | ScheduleError>> {
  try {
    const { readable, writable } = new TransformStream();
    req.body!.pipeTo(writable);

    const rawBody = await new Response(readable).text();
    const body = JSON.parse(rawBody);
    const question = getPrompt(body);
    const { answer, tokenUsage } = await scheduleReminder(question);

    // track traffic
    if (process.env.PERSIST_DATA !== '0') {
      const ip = req.ip || req.headers.get("X-Forwarded-For") || "unknown";
      await addUsage({
        ip,
        token: tokenUsage.totalTokens,
        question,
        answerList: answer,
      });
    } 

    let messageList: string[] = [];
    if (Array.isArray(answer)) {
      messageList = answer;
    } else if (typeof answer === "object") {
      for (const [k, v] of Object.entries(answer)) {
        messageList.push(v as string);
      }
    }
    return NextResponse.json({ remindMessages: messageList }, { status: 200 });
  } catch (err) {
    return handleErrorResponse(err);
  }
}

function handleErrorResponse(error: any): NextResponse<ScheduleError> {
  if (error.response) {
    console.error(error.response.status, error.response.data);
    return NextResponse.json({ error: error.response.data }, { status: 500 });
  } else {
    console.error(`Error with OpenAI API request: ${error.message}`);
    return NextResponse.json(
      { error: "An error occurred during your request." },
      { status: 500 },
    );
  }
}
