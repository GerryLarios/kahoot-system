import fs from "fs"
import path from "path"
import type { Quiz } from "@/types"

const quizzesDir = path.join(process.cwd(), "data", "quizzes")

export function getAllQuizzes(): Quiz[] {
  const files = fs.readdirSync(quizzesDir).filter((f) => f.endsWith(".json"))
  const quizzes: Quiz[] = []

  for (const file of files) {
    const content = fs.readFileSync(path.join(quizzesDir, file), "utf-8")
    const parsed: Quiz[] = JSON.parse(content)
    quizzes.push(...parsed)
  }

  return quizzes
}

export function getQuiz(id: string): Quiz | undefined {
  return getAllQuizzes().find((q) => q.id === id)
}
