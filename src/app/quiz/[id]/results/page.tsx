import { notFound } from "next/navigation"
import { getQuiz } from "@/lib/data"
import ResultsView from "./ResultsView"

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ a?: string }>
}

export default async function ResultsPage({ params, searchParams }: Props) {
  const { id } = await params
  const { a } = await searchParams
  const quiz = getQuiz(id)

  if (!quiz) notFound()

  const answers = a?.split(",").map(Number) ?? []

  return <ResultsView quiz={quiz} answers={answers} />
}
