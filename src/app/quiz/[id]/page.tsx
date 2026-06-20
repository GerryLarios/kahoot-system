import { notFound } from "next/navigation"
import { getQuiz } from "@/lib/data"
import QuizPlayer from "@/components/QuizPlayer"

interface Props {
  params: Promise<{ id: string }>
}

export default async function QuizPage({ params }: Props) {
  const { id } = await params
  const quiz = getQuiz(id)

  if (!quiz) notFound()

  return <QuizPlayer quiz={quiz} />
}
