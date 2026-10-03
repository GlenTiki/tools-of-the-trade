import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import {
  buildConversionPrompt,
  conversionArguments,
  convertSpecification,
} from "../src/domain/spec-converter";

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      input: { type: "string" },
      output: { type: "string" },
      "prompt-only": { type: "boolean" },
      help: { type: "boolean" },
    },
    strict: true,
  });
  if (values.help) {
    console.log(
      "Usage: npm run spec:convert -- --input spec.md --output project.json [--prompt-only]\n--prompt-only writes the conversion prompt as text instead of calling Claude.",
    );
    return;
  }
  if (!values.input || !values.output)
    throw new Error("--input and --output are required.");
  const specification = await readFile(values.input, "utf8");
  const output = values["prompt-only"]
    ? `${buildConversionPrompt(specification)}\n\nTarget JSON Schema:\n${conversionArguments().at(-1)}\n`
    : `${JSON.stringify(await convertSpecification(specification), null, 2)}\n`;
  await writeFile(values.output, output, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  console.log(
    `Wrote ${values["prompt-only"] ? "offline conversion prompt" : "unreviewed project draft"} to ${values.output}. Existing files are never overwritten.`,
  );
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Conversion failed.");
  process.exitCode = 1;
});
