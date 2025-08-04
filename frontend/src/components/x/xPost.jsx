"use client";

import { useState, useEffect } from "react";
import { generatePost } from "../../utils/linkedingeneratePost";
import { Loader2, Copy, Save, RefreshCw, FileText, Type, MessageSquareText } from "lucide-react";
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
import { Switch } from "../ui/switch";
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
const postGenerationOptions = ["Text Gen LLM's", "Images Gen LLM's", "Video Gen LLM's", "Audio Gen LLM's"];
const variationOptions = ["1", "2", "3", "4", "5", "6"];

const ResultCard = ({ result, index, onCopy, onSave, onRegenerate }) => {
  const savedCta = localStorage.getItem("cta") || "Basic";
  const savedAudience = localStorage.getItem("audience") || "General";
  const savedLanguage = localStorage.getItem("language") || "en";

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
          <div className="flex gap-2 items-center flex-wrap">
            <span className="bg-white/10 text-white/80 px-2 py-1 rounded-full">
              Tone: {result.tone ? result.tone.charAt(0).toUpperCase() + result.tone.slice(1) : "Unknown"}
            </span>
            <span className="bg-white/10 text-white/80 px-2 py-1 rounded-full">
              Category: {result.category || "General"}
            </span>
            <span className="bg-white/10 text-white/80 px-2 py-1 rounded-full">
              CTA: {savedCta}
            </span>
            <span className="bg-white/10 text-white/80 px-2 py-1 rounded-full">
              Target Audience: {savedAudience}
            </span>
            <span className="bg-white/10 text-white/80 px-2 py-1 rounded-full">
              Language: {savedLanguage.toUpperCase()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function XPost() {
  const [prompt, setPrompt] = useState("");
  const [wordCount, setWordCount] = useState(200);
  const [useHashtags, setUseHashtags] = useState(true);
  const [useEmojis, setUseEmojis] = useState(true);
  const [postStyle, setPostStyle] = useState("Professional");
  const [postGenerations, setPostGenerations] = useState("Text Gen LLM's");
  const [variations, setVariations] = useState("1");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [cta, setCta] = useState("none");
  const [audience, setAudience] = useState("");
  const [language, setLanguage] = useState("en");
  useEffect(() => {
    localStorage.setItem("cta", cta);
  }, [cta]);

  useEffect(() => {
    localStorage.setItem("audience", audience);
  }, [audience]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Prompt cannot be empty.");
      return;
    }

    setLoading(true);
    setResults([]);

    const data = {
      prompt,
      words: wordCount,
      tone: postStyle.toLowerCase(),
      template: "informative",
      add_hashtags: useHashtags,
      add_emojis: useEmojis,
      variations: parseInt(variations),
      call_to_action: cta === "none" ? null : cta,
      audience: audience === "none" ? null : audience,
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
          <h1 style={{ fontFamily: "'Times New Roman', Times, serif" }} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight text-white">
            X Post Generator
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto">
             Create bold, scroll-worthy posts for X that spark attention in seconds.
          </p>
        </div>

        <Card className="bg-black/10 backdrop-blur-md border border-white/40 text-white p-6 rounded-2xl shadow-lg ">
          <div className="space-y-4">
            <div>
              <Label className="text-white text-md mb-3">What’s your post prompt?</Label>
              <Textarea
                rows={4}
                className="bg-neutral-960 border border-neutral-800 text-white placeholder:text-neutral-500 resize-none"
                placeholder="e.g. Write a post announcing my new role at Google"
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
                <Switch checked={useHashtags} onCheckedChange={setUseHashtags} />
                <span className="text-sm text-white">Use Hashtags</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch checked={useEmojis} onCheckedChange={setUseEmojis} />
                <span className="text-sm text-white">Use Emojis</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-auto">
                <Label className="text-white text-md mb-2">Post Style</Label>
                <Select value={postStyle} onValueChange={setPostStyle}>
                  <SelectTrigger className="bg-neutral-950 border border-neutral-800 text-white w-full">
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

              <div className="w-full sm:w-auto">
                <Label className="text-white text-md mb-2">Post Generation</Label>
                <Select value={postGenerations} onValueChange={setPostGenerations}>
                  <SelectTrigger className="bg-neutral-950 border border-neutral-800 text-white w-full">
                    <SelectValue placeholder="Choose number" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-950 border border-neutral-800 text-white">
                    {postGenerationOptions.map((postGeneration) => (
                      <SelectItem key={postGeneration} value={postGeneration}>
                        {postGeneration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto">
                <Label className="text-white text-md mb-2">Variation count</Label>
                <Select value={variations} onValueChange={setVariations}>
                  <SelectTrigger className="bg-neutral-950 border border-neutral-800 text-white w-full">
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
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-semibold text-white mb-2">
                  Call to Action
                </label>
                <Select value={cta} onValueChange={setCta}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 focus:ring-cyan-500 transition w-full">
                    <SelectValue placeholder="Select CTA" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="Let's connect!">Let's connect!</SelectItem>
                    <SelectItem value="Share your thoughts below.">Share your thoughts below.</SelectItem>
                    <SelectItem value="Visit my website.">Visit my website.</SelectItem>
                    <SelectItem value="Contact me to collaborate.">Contact me to collaborate.</SelectItem>
                    <SelectItem value="DM me to collaborate!">DM me to collaborate!</SelectItem>
                    <SelectItem value="Check out the link in my bio.">Check out the link in my bio.</SelectItem>
                    <SelectItem value="Stay tuned for updates.">Stay tuned for updates.</SelectItem>
                    <SelectItem value="Tag someone who should see this.">Tag someone who should see this.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-sm font-semibold text-white mb-2">
                  Language
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 focus:ring-cyan-500 transition w-full">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-sm font-semibold text-white mb-2">
                  Target Audience
                </label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 focus:ring-cyan-500 transition w-full">
                    <SelectValue placeholder="Select Audience" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="Developers">Developers</SelectItem>
                    <SelectItem value="Designers">Designers</SelectItem>
                    <SelectItem value="Marketers">Marketers</SelectItem>
                    <SelectItem value="Tech Enthusiasts">Tech Enthusiasts</SelectItem>
                    <SelectItem value="Product Managers">Product Managers</SelectItem>
                    <SelectItem value="Entrepreneurs">Entrepreneurs</SelectItem>
                    <SelectItem value="Students">Students</SelectItem>
                    <SelectItem value="Hiring Managers">Hiring Managers</SelectItem>
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

        {!loading && results.length === 0 && prompt.trim() ? (
          <div className="text-center text-neutral-500 py-2">
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm text-neutral-400 mt-2">
              Start by generating a post to see results appear here ✨
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result, index) => (
              <ResultCard
                key={index}
                result={result}
                index={index}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        )}
        <div className="text-center text-sm text-neutral-500 -mt-4">
          Developed by <a href="https://ujjwalsaini.dev" className="text-cyan-500 hover:underline">UjjwalS</a>
        </div>
      </div>
    </main>
  );
}
