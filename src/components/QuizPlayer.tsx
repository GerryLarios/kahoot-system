"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Quiz, Question } from "@/types"
import Md from "@/components/Md"

interface Props {
  quiz: Quiz
}

function Timer({ onTimeout }: { onTimeout: () => void }) {
  const [timeLeft, setTimeLeft] = useState(20)

  useEffect(() => {
    if (timeLeft === 0) return
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer)
          onTimeout()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [onTimeout, timeLeft])

  return (
    <div className="text-center mb-4">
      <p className="text-4xl font-bold text-violet-600">{timeLeft}</p>
      <p className="text-sm text-zinc-400">seconds remaining</p>
    </div>
  )
}

export default function QuizPlayer({ quiz }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialQ = Math.min(
    Math.max(Number(searchParams.get("q")) || 0, 0),
    quiz.questions.length - 1,
  )
  const initialAnswers = searchParams.get("a")?.split(",").map(Number) ?? []

  const [currentIndex, setCurrentIndex] = useState(initialQ)
  const [answers, setAnswers] = useState<number[]>(initialAnswers)

  const question: Question = quiz.questions[currentIndex]
  const isAnswered = currentIndex < answers.length
  const selected = isAnswered ? answers[currentIndex] : null

  const answersRef = useRef(answers)
  const currentIndexRef = useRef(currentIndex)

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  const updateUrl = useCallback(
    (q: number, a: number[]) => {
      const params = new URLSearchParams()
      params.set("q", String(q))
      if (a.length > 0) params.set("a", a.join(","))
      router.replace(`/quiz/${quiz.id}?${params}`, { scroll: false })
    },
    [router, quiz.id],
  )

  const handleAnswer = useCallback((index: number) => {
    const idx = currentIndexRef.current
    const next = [...answersRef.current]
    next[idx] = index
    setAnswers(next)
    updateUrl(idx, next)
  }, [updateUrl])

  const handleTimeout = useCallback(() => {
    handleAnswer(-1)
  }, [handleAnswer])

  function handleNext() {
    if (currentIndex < quiz.questions.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      updateUrl(nextIndex, answersRef.current)
    } else {
      router.push(`/quiz/${quiz.id}/results?a=${answersRef.current.join(",")}`)
    }
  }

  const percentage = ((currentIndex + 1) / quiz.questions.length) * 100

  return (
    <div className="flex flex-col flex-1">
      <div className="h-2 bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full bg-violet-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex flex-col flex-1 items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        <div className="w-full mb-8">
          <p className="text-sm text-zinc-400 mb-1">
            Question {currentIndex + 1} of {quiz.questions.length}
          </p>
          <h2 className="text-2xl font-bold leading-snug">{question.question}</h2>
        </div>

        {!isAnswered && <Timer key={currentIndex} onTimeout={handleTimeout} />}

        {isAnswered && (
          <div className="w-full space-y-4 mb-6">
            {question.explanation && (
              <div className="rounded-xl bg-zinc-100 px-5 py-4 text-sm dark:bg-zinc-800">
                <p className="font-semibold mb-1">Explanation</p>
                <p className="text-zinc-600 dark:text-zinc-400"><Md text={question.explanation} /></p>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-violet-700"
            >
              {currentIndex < quiz.questions.length - 1 ? "Next" : "See Results"}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          {question.options.map((option, i) => {
            let classes =
              "w-full rounded-xl border-2 px-5 py-4 text-left font-medium transition-all duration-200"

            if (!isAnswered) {
              classes +=
                " border-zinc-200 bg-white hover:border-violet-400 hover:bg-violet-50 cursor-pointer dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-violet-500 dark:hover:bg-violet-950"
            } else if (i === question.correctAnswer) {
              classes += " border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
            } else if (i === selected && i !== question.correctAnswer) {
              classes += " border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
            } else {
              classes +=
                " border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"
            }

            return (
              <button
                key={i}
                onClick={() => !isAnswered && handleAnswer(i)}
                disabled={isAnswered}
                className={classes}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
