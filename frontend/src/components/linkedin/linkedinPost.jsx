"use client";

import { useState } from "react";
import { generatePost } from "../../utils/linkedingeneratePost";
import { Loader2, Copy,  Save, RefreshCw, FileText, Type, MessageSquareText } from "lucide-react";
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
import { Slider } from "../ui/slider";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";

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
const variationOptions = ["1", "2", "3", "4", "5", "6"];

const ResultCard = ({ result, index, onCopy, onSave, onRegenerate }) => {
  return (
    <Card className="backdrop-blur-xl bg-white/5 border border-white/10 text-white rounded-2xl shadow-2xl hover:shadow-[0_0_40px_#ffffff22] transition-shadow duration-300 group overflow-hidden">
      <CardHeader className="flex justify-between items-start px-6 pt-6 pb-4">
        <div>
          <CardTitle className="text-xl font-semibold tracking-tight">
            ✨ Variation {index + 1}
          </CardTitle>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-black" onClick={() => onCopy(result.post)} title="Copy">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-black" onClick={() => onSave(result)} title="Save">
            <Save className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-black" onClick={() => onRegenerate(index)} title="Regenerate">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-4">
        <p className="whitespace-pre-line text-white/90 leading-relaxed text-[1rem] tracking-wide">
          {result.post}
        </p>

        <div className="mt-6 flex flex-row gap-6 text-sm text-white/80 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 opacity-70" />
            Words: <span className="font-semibold text-white">{result.analysis.word_count}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 opacity-70" />
            Characters: <span className="font-semibold text-white">{result.analysis.char_count}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 opacity-70" />
            Sentences: <span className="font-semibold text-white">{result.analysis.sentence_count}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center border-t border-white/10 pt-4 text-xs text-white/60">
          <div className="flex gap-2 items-center">
            <span className="bg-white/10 text-white/80 px-2 py-1 rounded-full">Tone: Informative</span>
            <span className="bg-white/10 text-white/80 px-2 py-1 rounded-full">Category: Social Media</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [idea, setIdea] = useState("");
  const [wordCount, setWordCount] = useState(200);
  const [useHashtags, setUseHashtags] = useState(true);
  const [useEmojis, setUseEmojis] = useState(true);
  const [postStyle, setPostStyle] = useState("Professional");
  const [variations, setVariations] = useState("1");
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
      variations: parseInt(variations),
    };

    try {
      const res = await generatePost(data);

      if (!res?.results || !Array.isArray(res.results)) {
        toast.error("Invalid response from server.");
        return;
      }

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
          <h1 className="text-4xl font-bold mb-2 tracking-tight">LinkedIn Post Generator</h1>
          <p className="text-neutral-400 text-lg">Create engaging, on-brand LinkedIn content in seconds.</p>
        </div>

        <Card className="bg-neutral-900/70 border border-neutral-800 p-6 rounded-2xl shadow-lg backdrop-blur-md">
          <div className="space-y-4">
            <div>
              <Label className="text-white text-md mb-3">What’s your post prompt?</Label>
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

            <div>
              <Label className="text-white text-md mb-3">Word Count: {wordCount} words</Label>
              <Slider
                min={50}
                max={1000}
                step={1}
                defaultValue={[wordCount]}
                onValueChange={(val) => setWordCount(val[0])}
              />
            </div>

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

            <div className="flex flex-row items-center gap-4">
              <div>
                <Label className="text-white text-md mb-2">Post Style</Label>
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
              <div>
                <Label className="text-white text-md mb-2">How many variations</Label>
                <Select value={variations} onValueChange={setVariations}>
                  <SelectTrigger className="bg-neutral-950 border border-neutral-800 text-white">
                    <SelectValue placeholder="Choose number" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-950 border border-neutral-800 text-white">
                    {variationOptions.map((variation) => (
                      <SelectItem key={variation} value={variation}>
                        {variation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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

        {results.length > 0 ? (
          <div className="space-y-6">
            {results.map((result, i) => (
              <ResultCard key={i} result={result} index={i} onCopy={copyToClipboard} />
            ))}
          </div>
        ) : (
          !loading && (
            <p className="text-center text-neutral-500">No results yet. Generate a post to see magic happen ✨</p>
          )
        )}
      </div>
    </main>
  );
}
