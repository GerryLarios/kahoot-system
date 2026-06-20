import { getAllQuizzes } from "@/lib/data";
import Link from "next/link";

export default function Home() {
  const quizzes = getAllQuizzes();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col py-16 px-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Kahoot System
        </h1>
        <p className="text-lg text-zinc-500 mb-10">
          Select a quiz to test your knowledge.
        </p>

        {quizzes.length === 0 && (
          <p className="text-zinc-400">
            No quizzes found. Add a JSON file to{" "}
            <code className="text-sm bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
              data/quizzes/
            </code>
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-colors hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <h2 className="text-xl font-semibold mb-1">{quiz.title}</h2>
              <p className="text-sm text-zinc-500 mb-3">{quiz.description}</p>
              <span className="text-xs font-medium text-zinc-400 block mb-4">
                {quiz.questions.length} question
                {quiz.questions.length !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/flashcard/${quiz.id}`}
                  className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Flashcards
                </Link>
                <Link
                  href={`/quiz/${quiz.id}`}
                  className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Quiz
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
