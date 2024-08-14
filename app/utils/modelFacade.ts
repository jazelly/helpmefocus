import { ModelType } from "@/types/common";
import { ChatOpenAI } from "@langchain/openai";
import { LlamaChatSession, LlamaContext, LlamaModel } from "node-llama-cpp";
import { v4 } from "uuid";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

export class AbstractModel {
  type: ModelType;
  constructor(type: ModelType) {
    this.type = type;
  }

  async prompt(question: string): Promise<string> {
    throw Error("do not call abstract class methods");
  }

  /**
   * Prompt the question within the same session,
   * @param question
   * @param session can be string or number, whatever is used to identify a session by different providers
   */
  async promptSameSession(
    question: string,
    session?: string | number
  ): Promise<string> {
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

  async #prompt(question: string, session: LlamaChatSession): Promise<string> {
    const answer = await session.prompt(question, {
      maxTokens: this.context.getContextSize(),
    });
    return answer;
  }

  async prompt(question: string): Promise<string> {
    const session = new LlamaChatSession({ context: this.context });
    this.sessionMap[v4()] = session;
    return this.#prompt(question, session);
  }

  async promptSameSession(
    question: string,
    session?: string | number
  ): Promise<string> {
    const sessionKey =  session || v4();
    if (!this.sessionMap[sessionKey]) this.sessionMap[sessionKey] = new LlamaChatSession({ context: this.context });
    const a = await this.#prompt(question, this.sessionMap[sessionKey]);
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

  async prompt(question: string): Promise<string> {
    const chatHistory = []
    chatHistory.push(new HumanMessage(question));
    const answerRaw = await this.#model.invoke(chatHistory);
    const parser = new StringOutputParser();
    this.sessionMap[v4()] = chatHistory;
    return parser.invoke(answerRaw);
  }

  async promptSameSession(question: string, session?: string | number): Promise<string> {
    const sessionKey =  session || v4();
    const chatHistory = this.sessionMap[sessionKey] || [];
    chatHistory.push(new HumanMessage(question))
    const answerRaw = await this.#model.invoke(chatHistory);
    this.sessionMap[sessionKey] = chatHistory;
    const parser = new StringOutputParser();
    return parser.invoke(answerRaw);
  }
}
