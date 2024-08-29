import path from "path";
import fs from "fs";
import { ModelType } from "@/types/common";
import { AbstractModel, GGUFModel, OpenAIModel } from "./modelFacade";
import { getRootDir } from "./path";

const loadGGUFModels = (baseDir: string) => {
  const results: Record<string, string> = {};

  if (!fs.existsSync(baseDir)) return results;

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

interface LoadModelOptions {
  type: ModelType;
}
export const loadModel = async ({ type }: LoadModelOptions) => {
  let model: AbstractModel | undefined;
  switch (type) {
    case "gguf":
      if (process.env.ENV !== "development")
        throw Error("must use gguf model in local");

      const { LlamaModel } = await import("node-llama-cpp");
      const MODEL_DIR = path.join(getRootDir(), "models");
      const ggufModels = loadGGUFModels(MODEL_DIR);
      // we choose the first gguf model searched in path for now
      // GGUF is only available on local
      const ggufModel = Object.entries(ggufModels)[0]
        ? Object.entries(ggufModels)[0][1]
        : undefined;
      if (ggufModel) {
        model = new GGUFModel(
          new LlamaModel({
            modelPath: ggufModel,
          })
        );
      }

      break;
    case "openai":
      model = new OpenAIModel("gpt-4o-mini");
      break;

    default:
      throw Error("must choose a model type to load AI model");
  }
  return model;
};
