"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Card, CardHeader, CardContent, CardTitle, } from "../ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, } from "../ui/select";
import { Loader2, Copy, Save, RefreshCw, FileText, Type, MessageSquareText } from "lucide-react";
import { generatePost } from "../../utils/youtubegeneratePost";
import "react-toastify/dist/ReactToastify.css";

const postStyles = [ "Professional", "Friendly", "Sarcastic", "Bold", "Funny", "Relatable", "Inspiring", "Thought-Provoking", "Controversial", "Motivational" ];
const postTypeOptions = [ "Community Text Post", "Video Title", "Video Description", "Video Caption", "Poll", "Shorts Caption", "Question Post", "Image Post Caption", "Behind-the-Scenes Post", "Announcement" ];
const postTemplateOptions = [ "Technology", "Professional", "Lifestyle", "Educational", "Entertainment", "Inspirational", "Behind the Scenes", "Tutorial", "Review", "News Updates" ];
const postGenerationOptions = ["Text Gen LLM's", "Images Gen LLM's", "Video Gen LLM's", "Audio Gen LLM's"];
const variationOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const ctaOptions = [ "None", "Watch Now", "Like & Subscribe", "Comment Below", "Share This Video", "Turn On Notifications", "Watch Next Video", "Join Channel Membership", "Check Description", "Support the Channel"];
const languages = [ { label: "English", value: "en" }, { label: "Hindi", value: "hi" }, { label: "Spanish", value: "es" }, { label: "French", value: "fr" }, { label: "German", value: "de" }, { label: "Chinese", value: "zh" }, { label: "Japanese", value: "ja" }, { label: "Arabic", value: "ar" }, { label: "Portuguese", value: "pt" }, { label: "Russian", value: "ru" },];
const audienceOptions = [ "None", "General Viewers", "Kids", "Gamers", "Vlog Fans", "Tech Review Watchers", "DIY & How-To Seekers", "Education & Study Community", "Fitness & Wellness Enthusiasts", "Music & Entertainment Fans", "Aspiring YouTubers & Creators" ];

const ResultCard = ({ result, index, onCopy, onSave, onRegenerate }) => {
  const savedcta = localStorage.getItem("cta") || "Watch Now";
  const savedAudience = localStorage.getItem("audience") || "General Viewers";
  const savedLanguage = localStorage.getItem("language") || "en";
  const savedPostType = localStorage.getItem("postType") || "Video Description";

  return (
    <Card className="backdrop-blur-xl bg-white/5 border border-white/10 text-white rounded-2xl shadow-2xl hover:shadow-[0_0_40px_#ffffff22] transition-shadow duration-300 group overflow-hidden">
      <CardHeader className="flex justify-between items-start px-6 pt-6 pb-4">
        <div>
          <CardTitle className="text-xl font-semibold tracking-tight">
            ✨ Variation Post {index + 1}
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
            {/* Todo: For Reference */}
            {/* <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white/90 px-3 py-1 rounded-full shadow-sm">
              Tone: {result.tone ? result.tone.charAt(0).toUpperCase() + result.tone.slice(1) : "Unknown"}
            </span> */}
            <span className="bg-black/25 backdrop-blur-lg border border-white/20 text-white/85 px-3 py-1 rounded-full shadow-md">
              Tone: {result.tone ? result.tone.charAt(0).toUpperCase() + result.tone.slice(1) : "Unknown"}
            </span>
            <span className="bg-black/25 backdrop-blur-lg border border-white/20 text-white/85 px-3 py-1 rounded-full shadow-md">
              Post Type: {result.category || "General"}
            </span>
            <span className="bg-black/25 backdrop-blur-lg border border-white/20 text-white/85 px-3 py-1 rounded-full shadow-md">
              Call to Action: {savedcta}
            </span>
            <span className="bg-black/25 backdrop-blur-lg border border-white/20 text-white/85 px-3 py-1 rounded-full shadow-md">
              Target Audience: {savedAudience}
            </span>
            <span className="bg-black/25 backdrop-blur-lg border border-white/20 text-white/85 px-3 py-1 rounded-full shadow-md">
              Language: {savedLanguage.toUpperCase()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function YoutubePost() {
  const [prompt, setPrompt] = useState("");
  const [wordCount, setWordCount] = useState(80);
  const [useHashtags, setUseHashtags] = useState(true);
  const [useEmojis, setUseEmojis] = useState(false);
  const [postStyle, setPostStyle] = useState("Friendly");
  const [postTemplates, setPostTemplates] = useState("Entertainment");
  const [postType, setPostType] = useState("Video Description");
  const [postGenerations, setPostGenerations] = useState("Text Gen LLM's");
  const [variations, setVariations] = useState("3");
  const [cta, setCta] = useState("None");
  const [language, setLanguage] = useState("en");
  const [audience, setAudience] = useState("None");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    localStorage.setItem("cta", cta);
  }, [cta]);

  useEffect(() => {
    localStorage.setItem("audience", audience);
  }, [audience]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("postType", postType);
  }, [postType]);

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
      template: postTemplates.toLowerCase(),
      tone: postStyle.toLowerCase(),
      add_hashtags: useHashtags,
      add_emojis: useEmojis,
      postTypeOptions: postType,
      variations: parseInt(variations),
      call_to_action: cta === "none" ? null : cta,
      language: language,
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

  const regeneratePost = async (text) => {
    try {
      await handleGenerate();
      toast.success("✨ Posts regenerated successfully!");
    } catch {
      toast.error("Failed to regenerate posts!");
    }
  };

  return (
    <main className="min-h-screen text-white px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center">
          <h1 style={{ fontFamily: "'Times New Roman', Times, serif" }} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight text-white">
            YouTube Post Generator
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto">
             Boost channel buzz with posts your audience can't ignore
          </p>
        </div>

        <Card className="bg-black/10 backdrop-blur-md border border-white/40 text-white p-6 rounded-2xl shadow-lg ">
          <div className="space-y-4">
            <div>
              <Label className="text-white text-md mb-3">What’s the main focus of your YouTube video?</Label>
              <Textarea
                rows={4}
                className="bg-neutral-960 border border-neutral-800 text-white placeholder:text-neutral-500 resize-none"
                placeholder="e.g. Generate an engaging video description for my skincare routine"
                value={prompt}
                maxLength={200}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="text-right text-sm text-neutral-500">
                {prompt.length}/200 characters
              </div>
            </div>

            <div>
              <Label className="text-white text-md mb-3">Word Count: {wordCount} words</Label>
              <Slider
                min={20}
                max={200}
                step={1}
                defaultValue={[wordCount]}
                onValueChange={(val) => setWordCount(val[0])}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row items-center sm:gap-6">
              <Label className="flex items-center gap-2">
                <Switch checked={useHashtags} onCheckedChange={setUseHashtags} />
                <span className="text-sm text-white">Use Hashtags</span>
              </Label>
              <Label className="flex items-center gap-2">
                <Switch checked={useEmojis} onCheckedChange={setUseEmojis} />
                <span className="text-sm text-white">Use Emojis</span>
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-auto">
                <Label className="text-white text-md mb-2">Post Tone</Label>
                <Select value={postStyle} onValueChange={setPostStyle}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 transition w-full">
                    <SelectValue placeholder="Choose Post tone" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                    {postStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto">
                <Label className="text-white text-md mb-2">Post Type</Label>
                <Select value={postType} onValueChange={setPostType}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 transition w-full">
                    <SelectValue placeholder="Choose Post Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                    {postTypeOptions.map((postType) => (
                      <SelectItem key={postType} value={postType}>
                        {postType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto">
                <Label className="text-white text-md mb-2">Post Template</Label>
                <Select value={postTemplates} onValueChange={setPostTemplates}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 transition w-full">
                    <SelectValue placeholder="Choose Post Template" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                    {postTemplateOptions.map((postTemplate) => (
                      <SelectItem key={postTemplate} value={postTemplate}>
                        {postTemplate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="w-full sm:w-auto">
                <Label className="text-white text-md mb-2">Variation count</Label>
                <Select value={variations} onValueChange={setVariations}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 transition w-full">
                    <SelectValue placeholder="Choose number of variations" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                    {variationOptions.map((variation) => (
                      <SelectItem key={variation} value={variation}>
                        {variation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto">
                <Label className="block text-sm font-semibold text-white mb-2">Call to Action</Label>
                <Select value={cta} onValueChange={setCta}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 transition w-full">
                    <SelectValue placeholder="Select CTA" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                      {ctaOptions.map((ctaOption) => (
                        <SelectItem key={ctaOption} value={ctaOption}>
                          {ctaOption}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto">
                <Label className="block text-sm font-semibold text-white mb-2">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 transition w-full">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto">
                <Label className="block text-sm font-semibold text-white mb-2">Target Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 transition w-full">
                    <SelectValue placeholder="Select Target Audience" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                      {audienceOptions.map((audienceOption) => (
                        <SelectItem key={audienceOption} value={audienceOption}>
                          {audienceOption}
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
                onRegenerate={regeneratePost}
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
