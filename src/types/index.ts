export interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
}

export interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export interface QuizResult {
  questionId: number
  question: string
  options: string[]
  correctAnswer: number
  selectedAnswer: number
  isCorrect: boolean
  explanation?: string
}
