import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  outro,
  spinner,
  stream,
  text,
} from "@clack/prompts";
import { load } from "@std/dotenv";
import { generateText, stepCountIs, streamText, tool } from "ai";
import { z } from "zod";

await load({ export: true });

if (!Deno.env.get("GOOGLE_API_KEY")) {
  console.error("❌ Error: GOOGLE_API_KEY environment variable is not set.");
  console.log("\n💡 Please set your Google API key:");
  console.log("export GOOGLE_API_KEY=your_api_key_here\n");
  Deno.exit(1);
}

const google = createGoogleGenerativeAI({
  apiKey: Deno.env.get("GOOGLE_API_KEY"),
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

const textDecoder = new TextDecoder();

class AIChatbot {
  private messages: Message[] = [];

  constructor(initialMessage?: string) {
    if (initialMessage) {
      this.messages.push({ role: "user", content: initialMessage });
    }
  }

  private getTools() {
    return {
      getCurrentWorkingDirectory: tool({
        description: "Get the current working directory.",
        inputSchema: z.object({}),
        execute: async () => {
          try {
            const cwd = Deno.cwd();
            return `Successfully got the current working directory: ${cwd}`;
          } catch (error) {
            return `Error getting the current working directory: ${
              error instanceof Error ? error.message : String(error)
            }`;
          }
        },
      }),
      readDirectory: tool({
        description: "List files and directories in a given directory path",
        inputSchema: z.object({
          path: z.string().describe("The directory path to list"),
        }),
        execute: async ({ path }) => {
          try {
            const entries = [];
            for await (const entry of Deno.readDir(path)) {
              entries.push({
                name: entry.name,
                type: entry.isDirectory ? "directory" : "file",
              });
            }
            return `Successfully read directory "${path}". Found ${
              entries.length
            } items:\n${entries
              .map((e) => `- ${e.name} (${e.type})`)
              .join("\n")}`;
          } catch (error) {
            return `Error reading directory "${path}": ${
              error instanceof Error ? error.message : String(error)
            }`;
          }
        },
      }),
      readFile: tool({
        description: "Read the contents of a file given its path",
        inputSchema: z.object({
          path: z.string().describe("The file path to read"),
        }),
        execute: async ({ path }) => {
          try {
            const content = await Deno.readTextFile(path);
            return `Successfully read file "${path}" (${content.length} characters):\n\n${content}`;
          } catch (error) {
            return `Error reading file "${path}": ${
              error instanceof Error ? error.message : String(error)
            }`;
          }
        },
      }),
    };
  }

  async start() {
    console.clear();
    intro("🧞 The terminal Génie");
    let isFirstMessage = true;

    while (true) {
      if (isFirstMessage && this.messages.length !== 0) {
        log.info("You:");
        log.message(this.messages[0].content);
      } else {
        const userInput = await text({
          message: "You:",
          placeholder: "Ask me anything...",
          validate: (value) => {
            if (!value || value.trim().length === 0) {
              return "Please enter a message.";
            }
          },
        });

        if (isCancel(userInput)) {
          cancel("Operation cancelled.");
          return;
        }

        const userMessage = userInput.toString().trim();

        if (
          userMessage.toLowerCase() === "exit" ||
          userMessage.toLowerCase() === "quit"
        ) {
          break;
        }

        this.messages.push({ role: "user", content: userMessage });
      }

      if (isFirstMessage) isFirstMessage = false;

      const s = spinner();
      s.start("🧞 The génie is thinking...");

      try {
        const result = streamText({
          model: google("gemini-2.5-flash"),
          messages: this.messages,
          system:
            `You are an AI assistant called "The Génie". ` +
            `You live in a computer terminal, so you are particullary competent ` +
            `in computer science, and you answer with text that can be printed in ` +
            `the standard output (no markdown).`,
          tools: this.getTools(),
          stopWhen: stepCountIs(5),
        });

        let aiResponse = "";

        await result.toolCalls;

        s.stop("🧞 The Génie:");
        await stream.message(result.textStream);

        for await (const textPart of result.textStream) {
          aiResponse += textPart;
        }

        this.messages.push({ role: "assistant", content: aiResponse });
      } catch (error) {
        s.stop();
        log.error("An error occured.");
      }
    }

    outro("👋 Thanks for chatting! Goodbye!");
  }
}

if (import.meta.main) {
  const command = Deno.args[0];
  const rest = Deno.args.slice(1);

  if (command === "run") {
    intro("🧞 Calling the Génie");
    const s = spinner();
    s.start("🤔 The génie is thinking ");

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `What is the Linux Shell command to perform this task: ${rest.join(
        " "
      )}
      You can write your reflexion first, and then output the command between the <command> and the </command> tags.`,
    });

    s.stop("💡 The Génie have an idea");

    const rawCommand = text.split("<command>")[1].split("</command>")[0].trim();

    log.info(rawCommand);

    const shouldExecute = await confirm({
      message: "Do you want to execute this command?",
    });

    if (shouldExecute) {
      const { success, stderr, stdout } = await new Deno.Command("sh", {
        args: ["-c", rawCommand],
      }).output();

      if (!success) {
        log.error("An error occured");
        log.error(textDecoder.decode(stderr));
      } else {
        log.message(textDecoder.decode(stdout));
      }

      outro("Goodbye");
    }
  } else {
    // Start the chatbot
    const chatbot = new AIChatbot(
      Deno.args.length !== 0 ? Deno.args.join(" ") : undefined
    );

    await chatbot.start();
  }
}
