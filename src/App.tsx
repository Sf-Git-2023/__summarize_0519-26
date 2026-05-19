import { useState } from 'react';
import Markdown from 'react-markdown';
import { Copy, Loader2, Wand2 } from 'lucide-react';

export default function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError('');
    setResult('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '生成失敗');
      }
      
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || '發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">AI 會議記錄與翻譯助手</h1>
          <p className="text-gray-600 mt-2">貼上會議記錄，讓 AI 自動生成結構化總結並進行翻譯。</p>
        </header>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <textarea
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="請在此貼上會議逐字稿或重點筆記..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !text.trim()}
            className="mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Wand2 size={20} />
            )}
            {isLoading ? '生成中...' : '生成總結與翻譯'}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </section>

        {result && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">生成結果</h2>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600"
              >
                <Copy size={18} />
                複製結果
              </button>
            </div>
            <div className="prose max-w-none text-gray-800">
              <Markdown>{result}</Markdown>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
