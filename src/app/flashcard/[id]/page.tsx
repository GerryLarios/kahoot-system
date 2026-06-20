import { notFound } from "next/navigation"
import { getQuiz } from "@/lib/data"
import FlashCardPlayer from "@/components/FlashCardPlayer"

interface Props {
  params: Promise<{ id: string }>
}

export default async function FlashCardPage({ params }: Props) {
  const { id } = await params
  const quiz = getQuiz(id)

  if (!quiz) notFound()

  return <FlashCardPlayer quiz={quiz} />
}
