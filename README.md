# The terminal Génie 🧞

A simple LLM agent that can be called from the terminal.

## Why

I find myself always asking ChatGPT about which Linux command to run to perform what I want. With the Génie, I can save time and do it directly in the terminal.

This is also a good opportunity for me to build something with the [AI SDK](https://ai-sdk.dev/).

## Installation

Download the [Deno](https://deno.com/) Javascript runtime:

```sh
# On macOS or Linux
curl -fsSL https://deno.land/install.sh | sh

# On Windows
irm https://deno.land/install.ps1 | iex
```

Then install the Génie:

```sh
deno install -g -A jsr:@nicorio/genie
```

If you want to update to a newer version:

```sh
deno install -g -f -A jsr:@nicorio/genie@0.2.1
```

Replace the version number with the one you want.

## Models

Right now only Google `gemini-2.5-flash` is supported, because it is free 🤑 and good enouth for the use case. The GOOGLE_API_KEY environment variable should be available on the system.

## Usage

### Run mode

If the first argument is `run`, the Génie will suggest a shell command to perform what you ask.

```
~/$ genie run get all the files in this directory

🧞 Thinking...

ls -a
Do you want to execute this command? [y/N] y

.
..
deno.json
deno.lock
.env
.git
.github
.gitignore
LICENSE
README.md
src
.vscode
```

### Conversation mode

Calling the genie with an arbitrary question will start a conversation with him. In conversation mode, the génie has access to 3 tools:

- One to get the current working directory
- One to list the files and directories inside a directory
- One to read the content of a file.

```
~/$ genie What is in the current working directory?

┌  🧞 You woke up the terminal Génie
│
│  You:
│
│  What is in the current working directory?
│
◇  🧞 The Génie
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
