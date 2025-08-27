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
import { generatePost } from "../../utils/xgeneratePost";
import "react-toastify/dist/ReactToastify.css";

const postStyles = [ "Professional", "Witty", "Sarcastic", "Bold", "Funny", "Relatable", "Inspiring", "Thought_Provoking", "Controversial", "Motivational", "Minimal" ];
const postToneOptions = ["Formal", "Informal", "Friendly", "Neutral", "Assertive", "Empathetic", "Humorous", "Optimistic", "Pessimistic", "Encouraging", "Inspirational", "Persuasive", "Direct", "Candid"];
const postTweetTypeOptions = ["Single Tweet", "Poll", "Thread", "Quote Tweet", "Reply", "Retweet"];
const postGenerationOptions = ["Text Gen LLM's", "Images Gen LLM's", "Video Gen LLM's", "Audio Gen LLM's"];
const postGoalsOptions = ["Drive traffic", "Increase engagement", "Get Retweets", "Start Conversations", "Share News", "Go Viral", "Build community", "Educate audience", "Showcase creativity"];
const variationOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const languages = [ { label: "English", value: "en" }, { label: "Hindi", value: "hi" }, { label: "Spanish", value: "es" }, { label: "French", value: "fr" }, { label: "German", value: "de" }, { label: "Chinese", value: "zh" }, { label: "Japanese", value: "ja" }, { label: "Arabic", value: "ar" }, { label: "Portuguese", value: "pt" }, { label: "Russian", value: "ru" },];
const audienceOptions = [ "None", "General Public", "Tech Enthusiasts", "Startup Founders", "Investors & VCs", "Content Creators", "Influencers", "Journalists & Media", "Students & Learners", "Professionals & Executives" ];
const eventDetailOptions = [ "Breaking News", "Trending Topic", "Product Launch", "Sports Event", "Award Show", "Concert", "Holiday", "Company Milestone", "Viral Meme", "Movie/Series Release" ];

const ResultCard = ({ result, index, onCopy, onSave, onRegenerate }) => {
  const savedAudience = sessionStorage.getItem("audience") || "General";
  const savedLanguage = sessionStorage.getItem("language") || "en";
  const savedTweetType = sessionStorage.getItem("tweetType") || "Single Tweet";
  const savedPostGoal = sessionStorage.getItem("postGoal") || "Go Viral";

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
            <span className="bg-black/25 backdrop-blur-lg border border-white/20 text-white/85 px-3 py-1 rounded-full shadow-md">
              Template: {result.category ? result.category.charAt(0).toUpperCase() + result.category.slice(1) : "General"}
            </span>
            <span className="bg-black/25 backdrop-blur-lg border border-white/20 text-white/85 px-3 py-1 rounded-full shadow-md">
              Tone: {result.tone ? result.tone.charAt(0).toUpperCase() + result.tone.slice(1) : "Unknown"}
            </span>
            <span className="bg-black/25 backdrop-blur-lg border border-white/20 text-white/85 px-3 py-1 rounded-full shadow-md">
              Target Audience: {savedAudience}
            </span>
            <span className="bg-black/25 backdrop-blur-lg border border-white/20 text-white/85 px-3 py-1 rounded-full shadow-md">
              Language: {savedLanguage.toUpperCase()}
            </span>
            <span className="bg-black/25 backdrop-blur-lg border border-white/20 text-white/85 px-3 py-1 rounded-full shadow-md">
              Tweet Type: {savedTweetType.charAt(0).toUpperCase() + savedTweetType.slice(1)}
            </span>
            <span className="bg-black/25 backdrop-blur-lg border border-white/20 text-white/85 px-3 py-1 rounded-full shadow-md">
              Goal of the Post: {savedPostGoal.charAt(0).toUpperCase() + savedPostGoal.slice(1)}
            </span>
            <span className="bg-black/25 backdrop-blur-lg border border-white/20 text-white/85 px-3 py-1 rounded-full shadow-md">
              Post Generation: Text Generation LLMs
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function XPost() {
  const [prompt, setPrompt] = useState("");
  const [wordCount, setWordCount] = useState(30);
  const [useHashtags, setUseHashtags] = useState(true);
  const [useEmojis, setUseEmojis] = useState(false);
  const [useMentions, setUseMentions] = useState(false);
  const [useEvent, setUseEvent] = useState(false);
  const [postStyle, setPostStyle] = useState("Professional");
  const [postTone, setPostTone] = useState("Optimistic");
  const [postTweetsType, setPostTweetsType] = useState("Single Tweet");
  const [postGenerations, setPostGenerations] = useState("Text Gen LLM's");
  const [postGoals, setPostGoals] = useState("Go Viral");
  const [variations, setVariations] = useState("3");
  const [language, setLanguage] = useState("en");
  const [audience, setAudience] = useState("None");
  const [eventDetails, setEventDetails] = useState("Trending Topic");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    sessionStorage.setItem("audience", audience);
  }, [audience]);

  useEffect(() => {
    sessionStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    sessionStorage.setItem("tweetType", postTweetsType);
  }, [postTweetsType]);

  useEffect(() => {
    sessionStorage.setItem("postGoal", postGoals);
  }, [postGoals]);

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
      template: postStyle.toLowerCase(),
      tone: postTone.toLowerCase(),
      add_hashtags: useHashtags,
      add_emojis: useEmojis,
      add_mentions: useMentions,
      add_event: useEvent,
      postTweetTypeOptions: postTweetsType,
      postgoal: postGoals,
      variations: parseInt(variations),
      language: language,
      audience: audience === "none" ? null : audience,
      eventDetails: eventDetails === "none" ? null : eventDetails,
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

  const allowedGenerationOption = "Text Gen LLM's";
  const handlePostGenerationChange = (value) => {
    if (value !== allowedGenerationOption) {
      toast.error("Only 'Text Gen LLM's' is currently supported. Please select that option.");
      return;
    }
    setPostGenerations(value);
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
            X Post Generator
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto">
             Create bold, scroll-worthy posts for X that spark attention in seconds.
          </p>
        </div>

        <Card className="bg-black/10 backdrop-blur-md border border-white/40 text-white p-6 rounded-2xl shadow-lg ">
          <div className="space-y-4">
            <div>
              <Label className="text-white text-md mb-3">What would you like the tweet to be about?</Label>
              <Textarea
                rows={4}
                className="bg-neutral-960 border border-neutral-800 text-white placeholder:text-neutral-500 resize-none"
                placeholder="e.g. Create a thought-provoking tweet about AI replacing jobs"
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
              <Label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={useMentions} onCheckedChange={setUseMentions} />
                <span className="text-sm text-white">Add Mentions</span>
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={useEvent} onCheckedChange={setUseEvent} />
                <span className="text-sm text-white">Special Event</span>
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-auto">
                <Label className="text-white text-md mb-2">Post Template</Label>
                <Select value={postStyle} onValueChange={setPostStyle}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 transition w-full">
                    <SelectValue placeholder="Choose style" />
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
                <Label className="text-white text-md mb-2">Tweet Type</Label>
                <Select value={postTweetsType} onValueChange={setPostTweetsType}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 transition w-full">
                    <SelectValue placeholder="Choose number" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                    {postTweetTypeOptions.map((postTweetType) => (
                      <SelectItem key={postTweetType} value={postTweetType}>
                        {postTweetType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto">
                <Label className="text-white text-md mb-2">Tone of Post</Label>
                <Select value={postTone} onValueChange={setPostTone}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 transition w-full">
                    <SelectValue placeholder="Choose tone" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                    {postToneOptions.map((postTone) => (
                      <SelectItem key={postTone} value={postTone}>
                        {postTone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto">
                <Label className="text-white text-md mb-2">Post Generation</Label>
                <Select value={postGenerations} onValueChange={handlePostGenerationChange}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 transition w-full">
                    <SelectValue placeholder="Choose number" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                    {postGenerationOptions.map((postGeneration) => (
                      <SelectItem key={postGeneration} value={postGeneration}>
                        {postGeneration}
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
                    <SelectValue placeholder="Choose number" />
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
                    <SelectValue placeholder="Select Audience" />
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

              <div className="w-full sm:w-auto">
                <Label className="text-white text-md mb-2">Goal of the Post</Label>
                <Select value={postGoals} onValueChange={setPostGoals}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 transition w-full">
                    <SelectValue placeholder="Choose number" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                    {postGoalsOptions.map((postGoal) => (
                      <SelectItem key={postGoal} value={postGoal}>
                        {postGoal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {useEvent && (
                <div className="w-full sm:w-auto">
                  <Label className="block text-sm font-semibold text-white mb-2">Event details</Label>
                  <Select value={eventDetails} onValueChange={setEventDetails}>
                    <SelectTrigger className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg shadow-md focus:ring-2 transition w-full">
                      <SelectValue placeholder="Select Event Details"/>
                    </SelectTrigger>
                    <SelectContent className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-xl">
                      {eventDetailOptions.map((eventDetail) => (
                        <SelectItem key={eventDetail} value={eventDetail}>
                          {eventDetail}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
            <p className="text-lg font-medium text-neutral-700">
              No results found
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              Start by generating a post to see results appear here{" "}
              <span className="text-yellow-400">✨</span>
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
          <p className="inline-flex items-center gap-1 transition-colors duration-300">
            <span className="text-neutral-500">Developed with {" "}</span>
            <span className="animate-pulse text-red-700">❤️</span>
            <span className="text-neutral-500">by{" "}</span>
            <a
              href="https://ujjwalsaini.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-cyan-500 hover:text-cyan-400 hover:underline underline-offset-4 transition-all duration-300"
            >
              UjjwalS
            </a>
            <span className="animate-pulse text-cyan-400">✦</span>
          </p>
        </div>
      </div>
    </main>
  );
}
