#!/usr/bin/env node

import fs from "fs";
import path from "path";

interface QAPair {
  question: string;
  answer: string;
}

interface ParsedHeading {
  lineIndex: number;
  level: number;
  text: string;
}

async function fetchReadme(url: string): Promise<string> {
  const parsed = new URL(url);

  if (parsed.hostname === "gist.github.com") {
    const parts = parsed.pathname
      .replace(/#.*$/, "")
      .split("/")
      .filter(Boolean);
    const gistId = parts[parts.length - 1];
    const apiUrl = `https://api.github.com/gists/${gistId}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Failed to fetch gist: ${res.status}`);
    const data = (await res.json()) as {
      files: Record<
        string,
        { filename?: string; language?: string; content: string }
      >;
    };
    const files = data.files;
    const file =
      Object.values(files).find(
        (f) => f.filename?.endsWith(".md") || f.language === "Markdown",
      ) || Object.values(files)[0];
    if (!file) throw new Error("No files found in gist");
    return file.content as string;
  }

  if (parsed.hostname === "github.com") {
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const [owner, repo, ...rest] = parts;
      if (rest[0] === "blob" && rest.length >= 3) {
        const branch = rest[1];
        const filepath = rest.slice(2).join("/");
        return fetchReadme(
          `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filepath}`,
        );
      }
      if (rest[0] === "blob") {
        throw new Error("Invalid blob URL format");
      }
      const mainUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
      const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
      let res = await fetch(mainUrl);
      if (res.ok) return res.text();
      res = await fetch(masterUrl);
      if (res.ok) return res.text();
      throw new Error(`Failed to fetch README from ${owner}/${repo}`);
    }
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function parseQA(markdown: string): QAPair[] {
  const lines = markdown.split("\n");
  const headings: ParsedHeading[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    const m = trimmed.match(/^(?:\d+\.\s*)?(#{3,4})\s+(.+)/);
    if (m) {
      const level = m[1].length;
      const text = m[2].trim();
      if (text.includes("?")) {
        headings.push({ lineIndex: i, level, text });
      }
    }
  }

  const questions: QAPair[] = [];

  for (let h = 0; h < headings.length; h++) {
    const heading = headings[h];
    const startLine = heading.lineIndex + 1;
    const endLine =
      h < headings.length - 1 ? headings[h + 1].lineIndex : lines.length;

    const rawAnswer: string[] = [];
    let inCodeFence = false;

    for (let i = startLine; i < endLine; i++) {
      const line = lines[i];

      if (line.trimStart().startsWith("```")) {
        inCodeFence = !inCodeFence;
        rawAnswer.push(line);
        continue;
      }

      if (!inCodeFence) {
        const subM = line.trim().match(/^(?:\d+\.\s*)?(#{1,4})\s+(.+)/);
        if (subM) {
          const subLevel = subM[1].length;
          if (subLevel <= heading.level) break;
        }
      }

      rawAnswer.push(line);
    }

    const answer = rawAnswer
      .join("\n")
      .replace(/^\n+/, "")
      .replace(/\n+$/, "")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^ {4}/gm, "");

    if (answer) {
      questions.push({
        question: heading.text.replace(/\*\*/g, "").replace(/\*/g, ""),
        answer,
      });
    }
  }

  return questions;
}

function firstSentence(text: string): string {
  const clean = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^[-*\s]+/, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^ {4}/gm, "")
    .replace(/\[⬆ Back to Top\].*/g, "")
    .trim();

  if (!clean) return "";

  const paragraph = clean.split(/\n\n/)[0].replace(/\n/g, " ").trim();

  const sentenceMatch = paragraph.match(/^([^.!?]*[.!?])\s*/);
  if (sentenceMatch) return sentenceMatch[1].trim();

  if (paragraph.length <= 150) return paragraph;

  return paragraph.substring(0, paragraph.lastIndexOf(" ", 147)) + "...";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateMCQ(qas: QAPair[]) {
  const sentences = qas.map((qa) => firstSentence(qa.answer));

  return qas.map((qa, i) => {
    const correct = sentences[i] || "Answer not available";
    const others = sentences
      .filter((_, j) => j !== i)
      .filter((s) => s.length > 0);
    const shuffledOthers = shuffle(others);
    const wrong = shuffledOthers.slice(0, 3);

    while (wrong.length < 3) {
      wrong.push("None of the above");
    }

    const all = [correct, ...wrong];
    const shuffled = shuffle(all);
    const correctIndex = shuffled.findIndex((s) => s === correct);

    return {
      options: shuffled,
      correctAnswer: correctIndex,
    };
  });
}

function toTitle(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function main() {
  const [url, name] = process.argv.slice(2);

  if (!url || !name) {
    console.error("Usage: tsx scripts/extract.ts <url> <quiz-name>");
    console.error("  <url>  URL to GitHub repo README, blob file, or gist");
    console.error("  <quiz-name>  kebab-case identifier for the quiz file");
    process.exit(1);
  }

  if (!/^[a-z0-9-]+$/.test(name)) {
    console.error(
      "Error: quiz-name must be a kebab-case slug (letters, numbers, hyphens)",
    );
    process.exit(1);
  }

  console.log(`Fetching: ${url}`);
  const markdown = await fetchReadme(url);

  console.log("Parsing questions...");
  const qas = parseQA(markdown);

  if (qas.length === 0) {
    console.error(
      "No questions found. Make sure the README has ### or #### headings ending with ?",
    );
    process.exit(1);
  }

  console.log(`Found ${qas.length} questions`);

  const mcqResults = generateMCQ(qas);

  const quiz = {
    id: name,
    title: toTitle(name),
    description: `Auto-extracted from ${url}`,
    questions: qas.map((qa, i) => ({
      id: i + 1,
      question: qa.question,
      options: mcqResults[i].options,
      correctAnswer: mcqResults[i].correctAnswer,
      explanation: qa.answer,
    })),
  };

  const outputDir = path.join(process.cwd(), "data", "quizzes");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${name}.json`);

  fs.writeFileSync(outputPath, JSON.stringify([quiz], null, 2));
  console.log(`Written ${qas.length} questions to ${outputPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
