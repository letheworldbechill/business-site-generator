import fs from "fs";
import path from "path";

// Read template
const templatePath = path.resolve("docs/AI_TASK_TEMPLATE.md");
if (!fs.existsSync(templatePath)) {
  console.error(`Template not found: ${templatePath}`);
  process.exit(1);
}

// Read task file from argument
const taskArg = process.argv[2];
if (!taskArg) {
  console.error("Usage: node scripts/generate-ai-task.js docs/tasks/001_block_types.md");
  process.exit(1);
}

const taskPath = path.resolve(taskArg);
if (!fs.existsSync(taskPath)) {
  console.error(`Task file not found: ${taskPath}`);
  process.exit(1);
}

const template = fs.readFileSync(templatePath, "utf8");
const task = fs.readFileSync(taskPath, "utf8");

// Helper: extract section content from task file
function extract(label, content) {
  const regex = new RegExp(`${label}:\\s*\\n([\\s\\S]*?)(?=\\n[A-Z ]+:|$)`, "i");
  const match = content.match(regex);
  return match ? match[1].trim() : `[${label} not defined]`;
}

const taskId    = extract("TASK ID", task);
const goal      = extract("GOAL", task);
const files     = extract("FILES", task);
const reqs      = extract("REQUIREMENTS", task);
const tests     = extract("TESTS", task);
const success   = extract("SUCCESS", task);

const output = template
  .replace("{{task_id}}", taskId)
  .replace("{{goal}}", goal)
  .replace("{{files}}", files)
  .replace("{{requirements}}", reqs)
  .replace("{{tests}}", tests)
  .replace("{{success}}", success);

console.log(output);
