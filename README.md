# Help me Focus

Productivity Tool with AI Assistant

## Why

I couldn't find any app, or at least free app, to help myself focus. I personally tend to mutli-tasking unintentionally, which is counter-productive. 
With a good 2-hour chunk for focusing, the result tends to be trivial.

The goal of this tool is to make the use of LLM, and let it understand what you want to achieve during a certain period. The main idea is based on 
[Timeblocking](https://en.wikipedia.org/wiki/Timeblocking), a productivity technique for time management.


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
- Schdule table with DND, auto connected with time chunks
- More options of reminding, special sound effects for reminder
