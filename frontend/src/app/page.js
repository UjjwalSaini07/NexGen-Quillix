"use client";

import { useState } from 'react';
import { generatePost } from '../components/utils/generatePost';

export default function Home() {
  const [prompt, setPrompt] = useState('');
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
        variations: 2
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
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '2rem' }}>
      <h1>🪄 LinkedIn Post Generator</h1>
      <textarea
        rows={4}
        placeholder="What's your post idea?"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Post'}
      </button>

      {results.map((result, i) => (
        <div key={i} style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h3>✨ Variation {i + 1}</h3>
          <p>{result.post}</p>
          <small>
            Words: {result.analysis.word_count} | Characters: {result.analysis.char_count} | Sentences: {result.analysis.sentence_count}
          </small>
        </div>
      ))}
    </div>
  );
}
