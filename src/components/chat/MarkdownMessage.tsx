import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

type Props = {
  content: string
}

export default function MarkdownMessage({ content }: Props) {
  return <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{content}</ReactMarkdown>
}
