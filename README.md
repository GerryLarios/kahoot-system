# Kahoot System

A kahoot-style quiz platform for studying programming concepts. Extracts Q&A from GitHub repo READMEs and renders them as interactive quizzes or flashcards.

## Getting started

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding a quiz

Create a JSON file in `data/quizzes/`:

```json
[{
  "id": "my-quiz",
  "title": "My Quiz",
  "description": "...",
  "questions": [
    {
      "id": 1,
      "question": "What is X?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "..."
    }
  ]
}]
```

Or use the extract script to scrape from a GitHub repo or gist:

```bash
npx tsx scripts/extract.ts https://github.com/owner/repo my-quiz-name
```

Auto-generates multiple-choice options from the README's Q&A headings (`###` / `####` ending with `?`).

## Modes

- **Quiz** (`/quiz/[id]`) — timed, one question at a time, score at the end
- **Flashcard** (`/flashcard/[id]`) — reveal answer on demand, prev/next navigation

Both modes use URL query params for state — shareable and survives refresh.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build + type check |
| `pnpm lint` | ESLint |
| `npx tsx scripts/extract.ts <url> <name>` | Scrape README to `data/quizzes/<name>.json` |
