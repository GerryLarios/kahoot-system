"use client"

import Link from "next/link"
import type { Quiz } from "@/types"
import Md from "@/components/Md"

interface Props {
  quiz: Quiz
  answers: number[]
}

export default function ResultsView({ quiz, answers }: Props) {
  const results = quiz.questions.map((q, i) => ({
    ...q,
    selectedAnswer: answers[i] ?? -1,
    isCorrect: answers[i] === q.correctAnswer,
  }))

  const score = results.filter((r) => r.isCorrect).length
  const percentage = Math.round((score / quiz.questions.length) * 100)

  let color: string
  if (percentage >= 80) color = "text-emerald-600"
  else if (percentage >= 60) color = "text-amber-600"
  else color = "text-red-600"

  return (
    <div className="flex flex-col flex-1 items-center font-sans dark:bg-black">
      <main className="flex flex-col flex-1 w-full max-w-3xl py-16 px-8">
        <div className="text-center mb-12">
          <p className="text-sm text-zinc-400 mb-1">Your Score</p>
          <p className={`text-6xl font-bold ${color}`}>
            {score} / {quiz.questions.length}
          </p>
          <p className={`text-lg font-semibold ${color}`}>{percentage}%</p>
        </div>

        <div className="space-y-6">
          {results.map((r, i) => (
            <div
              key={r.id}
              className={`rounded-xl border-2 p-5 ${
                r.isCorrect
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 text-lg font-bold ${
                    r.isCorrect ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {r.isCorrect ? "✓" : "✗"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold mb-2">
                    {i + 1}. {r.question}
                  </p>

                  <div className="space-y-1.5">
                    {r.options.map((opt, j) => {
                      let classes =
                        "rounded-lg px-3 py-2 text-sm border "

                      if (j === r.correctAnswer) {
                        classes +=
                          "border-emerald-400 bg-emerald-100 font-medium dark:bg-emerald-900 dark:border-emerald-600"
                      } else if (j === r.selectedAnswer && !r.isCorrect) {
                        classes +=
                          "border-red-400 bg-red-100 font-medium dark:bg-red-900 dark:border-red-600"
                      } else {
                        classes +=
                          "border-transparent text-zinc-500"
                      }

                      return (
                        <div key={j} className={classes}>
                          <span className="text-xs font-bold uppercase tracking-wider mr-2">
                            {String.fromCharCode(65 + j)}
                          </span>
                          {opt}
                        </div>
                      )
                    })}
                  </div>

                  {r.explanation && (
                    <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="font-semibold">Explanation:</span>{" "}
                      <Md text={r.explanation} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-block rounded-xl bg-violet-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-violet-700"
          >
            Back to Quizzes
          </Link>
        </div>
      </main>
    </div>
  )
}
