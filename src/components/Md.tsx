import ReactMarkdown from "react-markdown"

interface Props {
  text: string
}

export default function Md({ text }: Props) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <span>{children}</span>,
        code: ({ children }) => (
          <code className="rounded bg-zinc-200 px-1 py-0.5 text-sm font-mono dark:bg-zinc-700">
            {children}
          </code>
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-600 underline dark:text-violet-400">
            {children}
          </a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  )
}
