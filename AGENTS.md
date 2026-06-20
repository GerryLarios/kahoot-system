# Kahoot System

## Commands

- `pnpm dev` — start dev server at `http://localhost:3000`
- `pnpm build` — production build (also runs TS type check)
- `pnpm lint` — ESLint
- `npx tsx scripts/extract.ts <url> <quiz-name>` — scrape GitHub repo/gist README into `data/quizzes/<quiz-name>.json`

## Structure

- **`data/quizzes/*.json`** — quiz data files. Each file is an array of `Quiz` objects with `{id, title, description, questions}`. The `id` field is the URL slug.
- **`src/lib/data.ts`** — reads quiz files via `fs` (Server Components only). `getAllQuizzes()` and `getQuiz(id)`.
- **`src/types/index.ts`** — `Quiz`, `Question`, `QuizResult` interfaces.
- **`src/components/Md.tsx`** — wraps `react-markdown` for rendering explanations (handles `` `code` ``, `**bold**`, `*italic*`, `[links](url)`).

## Routes

| Route | Type | State |
|---|---|---|
| `/` | Server | lists all quizzes |
| `/quiz/[id]` | Server→Client | `?q=0&a=0,1,2` (question index, answer indices) |
| `/quiz/[id]/results` | Server→Client | `?a=0,1,2` (answers) |
| `/flashcard/[id]` | Server→Client | `?c=0` (card index) |

## Convention notes

- Import alias: `@/*` maps to `src/*`.
- Quiz player uses URL query params for state (shareable, survives refresh). Do not use `useState` for navigation state.
- ESLint enforces rules from `eslint-config-next` (core-web-vitals + typescript). The custom `Md` component must handle the `react-hooks/immutability` rule — do not mutate objects (like `RegExp`) outside components.
- `pnpm-workspace.yaml` allows `esbuild`, `sharp`, `unrs-resolver` builds. If adding packages that run postinstall scripts, update `onlyBuiltDependencies`.

## Data format

```json
[{
  "id": "quiz-slug",
  "title": "Quiz Title",
  "description": "...",
  "questions": [{
    "id": 1,
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "..."
  }]
}]
```

## Extract script

`scripts/extract.ts` fetches markdown from GitHub repos (README.md), blobs, or gists. Parses `###`/`####` headings containing `?` as questions. Auto-generates MCQ options from other answers' first sentences. Resolves `main` then `master` for bare repo URLs.
