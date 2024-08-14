# Help me Focus

Productivity Tool with AI Assistant

## Why

I couldn't find anything handy to remind myself to focus on what I am doing, as I tend to mutli-tasking unintentionally, which is counter-productive and the result tends to be like, well, nothing gets accomplished.

The goal of this tool is to make the use of LLM, and let it understand what you want to achieve during a certain period,
so it can provide meaningful reminder within reasonable gaps. In that way, a user like me should be able to **focus** on a single task at one time.


## Getting Started

First, download a GGUF model to run on your machine through [`huggingface-cli`](https://huggingface.co/docs/huggingface_hub/en/guides/cli)

```
hugginface-cli login
python tools/download_model.py <model_name> --files <file_regex>
```

e.g.

```
python tools/download_model.py google/gemma-2-2b-it-GGUF
```

by default, it downloads all '*.gguf' files if `--files` is not specified.

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## What's next

- Integrate claude | mistral | grok | etc..
- Better TTS with support of `eleven-labs`
- More content for your schedule, potentially a curated list of tasks to do.
