"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Quiz, Question } from "@/types"
import Md from "@/components/Md"

interface Props {
  quiz: Quiz
}

export default function FlashCardPlayer({ quiz }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialCard = Math.min(
    Math.max(Number(searchParams.get("c")) || 0, 0),
    quiz.questions.length - 1,
  )

  const [cardIndex, setCardIndex] = useState(initialCard)
  const [revealed, setRevealed] = useState(false)

  const question: Question = quiz.questions[cardIndex]

  function updateUrl(c: number) {
    const params = new URLSearchParams()
    params.set("c", String(c))
    router.replace(`/flashcard/${quiz.id}?${params}`, { scroll: false })
  }

  function handlePrev() {
    const next = cardIndex - 1
    setCardIndex(next)
    setRevealed(false)
    updateUrl(next)
  }

  function handleNext() {
    if (cardIndex < quiz.questions.length - 1) {
      const next = cardIndex + 1
      setCardIndex(next)
      setRevealed(false)
      updateUrl(next)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl mx-auto">
        <p className="text-sm text-zinc-400 mb-1 text-center">
          Card {cardIndex + 1} of {quiz.questions.length}
        </p>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-bold leading-snug mb-6">
            {question.question}
          </h2>

          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="w-full rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-violet-700"
            >
              Show Answer
            </button>
          ) : (
            <div className="space-y-4">
              {question.options.length > 0 && (
                <div className="space-y-1.5">
                  {question.options.map((opt, i) => {
                    const isCorrect = i === question.correctAnswer
                    return (
                      <div
                        key={i}
                        className={`rounded-lg px-4 py-2.5 text-sm border ${
                          isCorrect
                            ? "border-emerald-400 bg-emerald-50 font-medium dark:bg-emerald-950 dark:border-emerald-600"
                            : "border-zinc-200 dark:border-zinc-700"
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wider mr-2">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                        {isCorrect && (
                          <span className="ml-2 text-emerald-600 text-xs font-bold">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {question.explanation && (
                <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm dark:bg-zinc-800">
                  <p className="font-semibold mb-1">Explanation</p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    <Md text={question.explanation} />
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={cardIndex === 0}
            className="rounded-xl border border-zinc-200 px-6 py-2.5 font-medium transition-colors hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            className="rounded-xl bg-violet-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-violet-700"
          >
            {cardIndex < quiz.questions.length - 1 ? "Next" : "Finish"}
          </button>
        </div>
      </div>
    </div>
  )
}
