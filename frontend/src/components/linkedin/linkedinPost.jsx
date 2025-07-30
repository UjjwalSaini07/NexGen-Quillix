"use client";

import { useState } from "react";
import { generatePost } from "../../utils/linkedingeneratePost";
import { Loader2, Copy } from "lucide-react";
import { toast } from "react-toastify";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Prompt cannot be empty.");
      return;
    }

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
      toast.success("✨ Posts generated successfully!");
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("📋 Copied to clipboard!");
    } catch {
      toast.error("Failed to copy!");
    }
  };

  return (
    <main className="min-h-screen text-white px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">
            LinkedIn Post Generator
          </h1>
          <p className="text-neutral-400 text-lg">
            Create engaging, on-brand LinkedIn content in seconds.
          </p>
        </div>

        <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 shadow-lg backdrop-blur-md">
          <div className="space-y-2">
            <Label className="text-white text-md">What's your post idea?</Label>
            <Textarea
              rows={5}
              className="bg-neutral-950 border border-neutral-800 focus-visible:ring-1 focus-visible:ring-purple-600 text-white resize-none placeholder:text-neutral-500"
              placeholder="e.g. I want to write about AI trends in 2025..."
              value={prompt}
              maxLength={1000}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="text-right text-sm text-neutral-500">
              {prompt.length}/1000 characters
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Generating...
              </>
            ) : (
              "Generate Post"
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-6">
            {results.map((result, i) => (
              <Card
                key={i}
                className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 text-white rounded-xl shadow-lg"
              >
                <CardHeader className="flex justify-between items-center px-5 pt-5 pb-3">
                  <CardTitle className="text-lg font-semibold">
                    ✨ Variation {i + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-neutral-400 hover:text-white"
                    onClick={() => copyToClipboard(result.post)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <p className="whitespace-pre-line text-neutral-200 leading-relaxed text-base">
                    {result.post}
                  </p>
                  <div className="mt-4 text-sm text-neutral-500 border-t border-neutral-800 pt-3">
                    Words: <span className="font-medium">{result.analysis.word_count}</span> &nbsp;|&nbsp;
                    Characters: <span className="font-medium">{result.analysis.char_count}</span> &nbsp;|&nbsp;
                    Sentences: <span className="font-medium">{result.analysis.sentence_count}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
