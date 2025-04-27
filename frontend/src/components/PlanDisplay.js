import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function PlanDisplay({ plan }) {
  return (
    <div className="mt-6 p-6 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
      <h3 className="text-xl font-medium text-blue-800">Emergency Plan</h3>
      <div className="mt-2 text-gray-700 leading-relaxed prose prose-blue max-w-none overflow-auto">
        <Markdown
          children={plan}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        />
      </div>
    </div>
  );
}
