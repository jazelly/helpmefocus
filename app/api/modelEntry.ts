import { ModelType } from "@/types/common";
import { ChatOpenAI } from "@langchain/openai";
import { LlamaChatSession, LlamaContext, LlamaModel } from "node-llama-cpp";
import { v4 } from "uuid";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { type ChatGeneration } from "@langchain/core/outputs";

export class AbstractModel {
  type: ModelType;
  constructor(type: ModelType) {
    this.type = type;
  }

  async prompt<T>(question: string): Promise<T> {
    throw Error("do not call abstract class methods");
  }

  /**
   * Prompt the question within the same session,
   * @param question
   * @param session can be string or number, whatever is used to identify a session by different providers
   */
  async promptSameSession<T>(
    question: string,
    session?: string | number,
  ): Promise<TemplateStringsArray> {
    throw Error("do not call abstract class methods");
  }
}

export class GGUFModel extends AbstractModel {
  #ggufModel: LlamaModel;
  context: LlamaContext;
  readonly sessionMap: Record<string, LlamaChatSession>;

  constructor(model: LlamaModel) {
    super("gguf");
    this.#ggufModel = model;
    this.context = new LlamaContext({ model: this.#ggufModel });
    this.sessionMap = {};
  }

  async #prompt<T = string>(
    question: string,
    session: LlamaChatSession,
  ): Promise<T> {
    const answer = await session.prompt(question, {
      maxTokens: this.context.getContextSize(),
    });
    return answer as unknown as T;
  }

  async prompt<T>(question: string): Promise<T> {
    const session = new LlamaChatSession({ context: this.context });
    this.sessionMap[v4()] = session;
    return this.#prompt(question, session);
  }

  async promptSameSession<T>(
    question: string,
    session?: string | number,
  ): Promise<T> {
    const sessionKey = session || v4();
    if (!this.sessionMap[sessionKey])
      this.sessionMap[sessionKey] = new LlamaChatSession({
        context: this.context,
      });
    const a = await this.#prompt<T>(question, this.sessionMap[sessionKey]);
    return a;
  }
}

export class OpenAIModel extends AbstractModel {
  #model: ChatOpenAI;
  readonly sessionMap: Record<string, BaseMessage[]>;
  constructor(modelName: "gpt-4o" | "gpt-4o-mini" | "gpt-4" | "gpt-4-turbo") {
    super("openai");
    this.#model = new ChatOpenAI({ model: modelName });
    this.sessionMap = {};
  }

  async prompt<T>(question: string): Promise<T> {
    const chatHistory: HumanMessage[] = [];
    chatHistory.push(new HumanMessage(question));
    const answerRaw = await this.#model.invoke(chatHistory);
    const parser = new StringOutputParser();
    this.sessionMap[v4()] = chatHistory;
    const answer = (await parser.invoke(answerRaw)) as unknown as T;
    return answer;
  }

  parseEscapedJson(escapedJsonString: string): {
    answer: Record<string, any>;
    source: string;
  } {
    // Remove the ```json\n prefix and \n``` suffix
    let cleanedString = escapedJsonString
      .replace("```json", "")
      .replaceAll(/`/gm, "")
      .replaceAll("\n", "");

    const result = JSON.parse(cleanedString);
    return result;
  }

  async promptSameSession<T extends any>(
    question: string,
    session?: string | number,
  ): Promise<T> {
    const sessionKey = session || v4();
    const chatHistory = this.sessionMap[sessionKey] || [];
    chatHistory.push(new HumanMessage(question));
    const answerRaw = await this.#model.generate([chatHistory]);
    const tokenUsage = answerRaw.llmOutput?.tokenUsage ?? {};
    const generation = answerRaw.generations[0][0] as ChatGeneration;
    const answer = this.parseEscapedJson(
      generation.message.content as string,
    ).answer;

    chatHistory.push(new AIMessage(JSON.stringify(answer)));
    this.sessionMap[sessionKey] = chatHistory;
    return { answer, tokenUsage } as unknown as T;
  }
}
