# Help me Focus

Productivity Tool with AI Assistant

[Demo](https://helpmefocus.co)

## What it is

- It is a timer application based on the theory [Timeblocking](https://en.wikipedia.org/wiki/Timeblocking).
- It is a supervisor reminding you of the goal for every x minutes.

## What it is not

- It is not a [Pomodoro](https://en.wikipedia.org/wiki/Pomodoro_Technique) timer.
- It is not a schedule management tool

## Getting Started

It currently supports LLM from Open AI API or any GGUF models.

### Open AI

Place the Open AI Key in `.env` by copying `.env.example`

### GGUF

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

- Better UI for reminder and more dynamic options for reminding intervals
- Better TTS with support of `eleven-labs`
- More options of reminding, special sound effects for reminder
