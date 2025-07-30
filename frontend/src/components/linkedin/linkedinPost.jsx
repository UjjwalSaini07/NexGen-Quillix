"use client";

import { useState } from "react";
import { generatePost } from "../../utils/linkedingeneratePost";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResults([]);

    try {
      const data = {
        prompt,
        tone: "professional",
        template: "informative",
        words: 200,
        add_hashtags: true,
        add_emojis: true,
        variations: 2,
      };

      const res = await generatePost(data);
      setResults(res.results);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🪄 LinkedIn Post Generator
        </h1>

        <textarea
          className="w-full p-4 rounded-xl bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 resize-none"
          rows={5}
          placeholder="What's your post idea?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          {loading && <Loader2 className="animate-spin h-5 w-5" />}
          {loading ? "Generating..." : "Generate Post"}
        </button>

        <div className="mt-10 space-y-6">
          {results.map((result, i) => (
            <div
              key={i}
              className="bg-neutral-900 border border-neutral-700 rounded-xl p-5 shadow-md"
            >
              <h3 className="text-lg font-semibold mb-2">✨ Variation {i + 1}</h3>
              <p className="text-neutral-200 whitespace-pre-line">{result.post}</p>
              <div className="text-sm text-neutral-400 mt-3">
                Words: {result.analysis.word_count} | Characters:{" "}
                {result.analysis.char_count} | Sentences:{" "}
                {result.analysis.sentence_count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
