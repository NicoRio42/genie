# The terminal Génie 🧞

A simple LLM agent that can be called from the terminal.

## Installation

Download the [Deno](https://deno.com/) Javascript runtime:

```sh
# On macOS or Linux
curl -fsSL https://deno.land/install.sh | sh

# On Windows
irm https://deno.land/install.ps1 | iex
```

```sh
deno install -g -A @nicorio/genie
```

## Models

Right now only Google `gemini-2.5-flash` is supported. The GOOGLE_API_KEY environment variable should be available on the system.

## Usage

## Run

If the first argument is `run`, the Génie will suggest a shell command to perform what you ask.

```
~/$ genie run get all the files in this directory

┌  🧞 Calling the Génie
│
◇  💡 The Génie has an idea
│
●  ls -a
│
◇  Do you want to execute this command?
│  Yes
│
│  .
│  ..
│  deno.json
│  deno.lock
│  .env
│  .gitignore
│  README.md
│  src
│  .vscode
│
│
└  Goodbye
```

## Conversation

Calling the genie with an arbitrary question will start a conversation with him. In conversation mode, the génie has access to 3 tools:

- One to get the current working directory
- One to list the files and directories inside a directory
- One to read the content of a file.

```
~/$ genie What is in the current working directory?

┌  🧞 The terminal Génie
│
│  You:
│
│  What is in the current working directory?
│
◇
│
│  The current working directory
│  contains the following items:
│  - deno.json (file)
│  - deno.lock (file)
│  - .env (file)
│  - .vscode (directory)
│  - .gitignore (file)
│  - src (directory)
│  - README.md (file)
│
◆  You:
│  Ask me anything...
└
```
