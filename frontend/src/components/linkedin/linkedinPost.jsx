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
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";

import "react-toastify/dist/ReactToastify.css";

const postStyles = [
  "Professional",
  "Casual",
  "Informative",
  "Motivational",
  "Witty",
  "Inspirational",
  "Direct",
  "Narrative",
  "Concise",
  "Technical",
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [idea, setIdea] = useState("");
  const [wordCount, setWordCount] = useState(200);
  const [useHashtags, setUseHashtags] = useState(true);
  const [useEmojis, setUseEmojis] = useState(true);
  const [postStyle, setPostStyle] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Prompt cannot be empty.");
      return;
    }

    setLoading(true);
    setResults([]);

    const data = {
      prompt,
      idea,
      tone: postStyle.toLowerCase(),
      template: "informative",
      words: wordCount,
      add_hashtags: useHashtags,
      add_emojis: useEmojis,
      variations: 2,
    };

    try {
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

        <Card className="bg-neutral-900/70 border border-neutral-800 p-6 rounded-2xl shadow-lg backdrop-blur-md">
          <div className="space-y-4">
            {/* Post Prompt */}
            <div>
              <Label className="text-white text-md">What’s your post prompt?</Label>
              <Textarea
                rows={4}
                className="bg-neutral-950 border border-neutral-800 text-white placeholder:text-neutral-500 resize-none"
                placeholder="e.g. I want to write about AI trends in 2025..."
                value={prompt}
                maxLength={1000}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="text-right text-sm text-neutral-500">
                {prompt.length}/1000 characters
              </div>
            </div>

            {/* Post Idea */}
            <div>
              <Label className="text-white text-md">What's your post idea?</Label>
              <Input
                className="bg-neutral-950 border border-neutral-800 text-white"
                placeholder="e.g. How AI will change job roles..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              />
            </div>

            {/* Word Count Slider */}
            <div>
              <Label className="text-white text-md">Word Count: {wordCount} words</Label>
              <Slider
                min={50}
                max={1000}
                step={50}
                defaultValue={[wordCount]}
                onValueChange={(val) => setWordCount(val[0])}
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <Checkbox checked={useHashtags} onCheckedChange={setUseHashtags} />
                <span className="text-sm text-white">Use Hashtags</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={useEmojis} onCheckedChange={setUseEmojis} />
                <span className="text-sm text-white">Use Emojis</span>
              </label>
            </div>

            {/* Post Style */}
            <div>
              <Label className="text-white text-md mb-1">Post Style</Label>
              <Select value={postStyle} onValueChange={setPostStyle}>
                <SelectTrigger className="bg-neutral-950 border border-neutral-800 text-white">
                  <SelectValue placeholder="Choose style" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-950 border border-neutral-800 text-white">
                  {postStyles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50"
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
        </Card>

        {/* Result Section */}
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
