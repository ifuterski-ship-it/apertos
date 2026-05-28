'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Settings, X, Loader2, CheckCircle, AlertCircle, Trash2, Zap } from 'lucide-react';

type Model = 'wan-2.1' | 'ltx-video' | 'mochi-1';
type AspectRatio = '16:9' | '9:16' | '1:1';
type Duration = '3' | '5' | '8';
type Style = 'Cinematic' | 'Neon' | 'Realistic' | 'Animated' | 'Vintage';
type Status = 'idle' | 'starting' | 'processing' | 'done' | 'error';

interface HistoryItem {
  id: string;
  prompt: string;
  model: Model;
  style: Style;
  aspectRatio: AspectRatio;
  videoUrl: string;
  createdAt: string;
}

const MODELS = [
  { id: 'wan-2.1' as Model, name: 'Wan 2.1', tag: 'Fast · 480p' },
  { id: 'ltx-video' as Model, name: 'LTX Video', tag: 'High Quality' },
  { id: 'mochi-1' as Model, name: 'Mochi 1', tag: 'Cinematic' },
];

const STYLES: Style[] = ['Cinematic', 'Neon', 'Realistic', 'Animated', 'Vintage'];
const ASPECT_RATIOS: AspectRatio[] = ['16:9', '9:16', '1:1'];
const DURATIONS: Duration[] = ['3', '5', '8'];

const ACCENT = '#c8ff00';
const BG = '#0a0a0b';
const CARD = '#111115';
const BORDER = 'rgba(255,255,255,0.08)';
const MUTED = '#666';

export default function VortexPage() {
  const [apiKey, setApiKey] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<Model>('wan-2.1');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState<Duration>('5');
  const [style, setStyle] = useState<Style>('Cinematic');

  const [status, setStatus] = useState<Status>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [progress, setProgress] = useState(0);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const currentPromptRef = useRef('');
  const currentModelRef = useRef<Model>('wan-2.1');
  const currentStyleRef = useRef<Style>('Cinematic');
  const currentAspectRef = useRef<AspectRatio>('16:9');

  useEffect(() => {
    const key = localStorage.getItem('vortex_api_key') ?? '';
    setApiKey(key);
    setApiKeyInput(key);
    const stored = localStorage.getItem('vortex_history');
    if (stored) {
      try { setHistory(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const saveKey = () => {
    localStorage.setItem('vortex_api_key', apiKeyInput);
    setApiKey(apiKeyInput);
    setShowApiModal(false);
  };

  const stopPolling = () => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  };

  const addToHistory = useCallback((item: HistoryItem) => {
    setHistory(prev => {
      const updated = [item, ...prev].slice(0, 10);
      localStorage.setItem('vortex_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const poll = useCallback(async (predictionId: string, key: string) => {
    const elapsed = Date.now() - startTimeRef.current;
    setProgress(Math.min(88, 10 + (elapsed / 90000) * 78));

    try {
      const res = await fetch(`/api/poll/${predictionId}`, {
        headers: { 'x-replicate-key': key },
      });
      const data = await res.json();

      if (data.status === 'succeeded') {
        stopPolling();
        const url = Array.isArray(data.output) ? data.output[0] : data.output;
        setVideoUrl(url);
        setStatus('done');
        setProgress(100);
        setStatusMessage('Video ready!');
        addToHistory({
          id: predictionId,
          prompt: currentPromptRef.current,
          model: currentModelRef.current,
          style: currentStyleRef.current,
          aspectRatio: currentAspectRef.current,
          videoUrl: url,
          createdAt: new Date().toISOString(),
        });
      } else if (data.status === 'failed' || data.status === 'canceled') {
        stopPolling();
        setStatus('error');
        setStatusMessage(data.error ?? 'Generation failed. Check your API key and try again.');
      } else if (data.status === 'processing') {
        setStatus('processing');
        setStatusMessage('Generating your video…');
      }
    } catch { /* network hiccup — keep polling */ }
  }, [addToHistory]);

  const handleGenerate = async () => {
    if (!apiKey) { setShowApiModal(true); return; }
    if (!prompt.trim()) return;

    stopPolling();
    currentPromptRef.current = prompt;
    currentModelRef.current = model;
    currentStyleRef.current = style;
    currentAspectRef.current = aspectRatio;
    startTimeRef.current = Date.now();

    setStatus('starting');
    setStatusMessage('Starting generation…');
    setVideoUrl('');
    setProgress(5);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, aspectRatio, duration, style, apiKey }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setStatusMessage(data.error ?? 'Failed to start generation.');
        return;
      }

      setStatus('processing');
      setStatusMessage('Generating your video…');
      setProgress(10);
      pollingRef.current = setInterval(() => poll(data.id, apiKey), 2000);
    } catch {
      setStatus('error');
      setStatusMessage('Network error. Please try again.');
    }
  };

  useEffect(() => () => stopPolling(), []);

  const isGenerating = status === 'starting' || status === 'processing';

  const tabStyle = (active: boolean) => ({
    flex: 1,
    padding: '10px 4px',
    borderRadius: '8px',
    cursor: 'pointer' as const,
    fontSize: '12px',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    border: `1px solid ${active ? ACCENT : BORDER}`,
    background: active ? 'rgba(200,255,0,0.1)' : 'transparent',
    color: active ? ACCENT : MUTED,
  });

  const pillStyle = (active: boolean) => ({
    padding: '8px 18px',
    borderRadius: '100px',
    cursor: 'pointer' as const,
    fontSize: '13px',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    border: `1px solid ${active ? ACCENT : BORDER}`,
    background: active ? 'rgba(200,255,0,0.1)' : 'transparent',
    color: active ? ACCENT : MUTED,
  });

  return (
    <div style={{ background: BG, minHeight: '100vh' }}>

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${BORDER}`, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: `${BG}ee`, backdropFilter: 'blur(12px)', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', background: ACCENT, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ width: '18px', height: '18px', color: BG }} />
          </div>
          <span className="vx-heading" style={{ fontSize: '26px', color: '#fff' }}>VORTEX</span>
          <span style={{ fontSize: '11px', color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', paddingTop: '3px' }}>AI Video</span>
        </div>
        <button
          onClick={() => setShowApiModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px', border: `1px solid ${apiKey ? 'rgba(200,255,0,0.3)' : BORDER}`, background: 'transparent', color: apiKey ? ACCENT : '#999', cursor: 'pointer', borderRadius: '8px', fontSize: '12px', fontFamily: 'inherit' }}
        >
          <Settings style={{ width: '13px', height: '13px' }} />
          {apiKey ? 'API Key ✓' : 'Set API Key'}
        </button>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h1 className="vx-heading" style={{ fontSize: 'clamp(52px, 9vw, 88px)', lineHeight: 1, marginBottom: '12px' }}>
            GENERATE<br />
            <span style={{ color: ACCENT }}>ANY VIDEO</span>
          </h1>
          <p style={{ color: '#555', fontSize: '15px', maxWidth: '420px', margin: '0 auto' }}>
            Describe your vision. AI turns it into video using Replicate&apos;s free models.
          </p>
        </div>

        {/* Form */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>

          {/* Prompt */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#555', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>Prompt</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe your video… e.g. A lone astronaut floating through a nebula, slow motion, cinematic"
              rows={4}
              style={{ width: '100%', background: BG, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '14px', color: '#fff', fontSize: '15px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: '1.6', transition: 'border-color 0.15s' }}
              onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = '0 0 0 1px rgba(200,255,0,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Model + Aspect + Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px', marginBottom: '22px' }}>
            <div>
              <label style={{ display: 'block', color: '#555', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>Model</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value as Model)}
                  style={{ width: '100%', background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '10px 36px 10px 12px', color: '#fff', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', outline: 'none', appearance: 'none', WebkitAppearance: 'none' }}
                >
                  {MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name} — {m.tag}</option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: MUTED, fontSize: '10px' }}>▼</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#555', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>Aspect Ratio</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {ASPECT_RATIOS.map(ar => (
                  <button key={ar} onClick={() => setAspectRatio(ar)} style={tabStyle(ar === aspectRatio)}>{ar}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#555', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>Duration</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {DURATIONS.map(d => (
                  <button key={d} onClick={() => setDuration(d)} style={tabStyle(d === duration)}>{d}s</button>
                ))}
              </div>
            </div>
          </div>

          {/* Style presets */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', color: '#555', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '10px' }}>Style Preset</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {STYLES.map(s => (
                <button key={s} onClick={() => setStyle(s)} style={pillStyle(s === style)}>{s}</button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="vx-heading"
            style={{ width: '100%', padding: '18px', background: !prompt.trim() || isGenerating ? '#1e1e22' : ACCENT, color: !prompt.trim() || isGenerating ? '#444' : BG, border: 'none', borderRadius: '10px', fontSize: '20px', cursor: !prompt.trim() || isGenerating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'background 0.2s, color 0.2s' }}
          >
            {isGenerating ? (
              <><Loader2 style={{ width: '18px', height: '18px', animation: 'spin 0.8s linear infinite' }} />GENERATING…</>
            ) : '▶ GENERATE VIDEO'}
          </button>
        </div>

        {/* Progress */}
        {isGenerating && (
          <div style={{ background: CARD, border: `1px solid rgba(200,255,0,0.15)`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: ACCENT, fontSize: '13px' }}>{statusMessage}</span>
              <span style={{ color: '#444', fontSize: '12px' }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ background: '#1a1a1e', borderRadius: '100px', height: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: ACCENT, width: `${progress}%`, transition: 'width 1s ease', borderRadius: '100px', animation: 'pulse-bar 2s ease infinite' }} />
            </div>
            <p style={{ color: '#444', fontSize: '11px', marginTop: '10px' }}>Typically takes 1–3 minutes depending on model and duration.</p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={{ background: '#120a0a', border: '1px solid rgba(255,70,70,0.25)', borderRadius: '12px', padding: '18px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle style={{ width: '18px', height: '18px', color: '#ff4444', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ color: '#ff6666', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Generation failed</p>
              <p style={{ color: '#666', fontSize: '13px', lineHeight: 1.5 }}>{statusMessage}</p>
            </div>
          </div>
        )}

        {/* Video output */}
        {status === 'done' && videoUrl && (
          <div style={{ background: CARD, border: `1px solid rgba(200,255,0,0.2)`, borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle style={{ width: '17px', height: '17px', color: ACCENT }} />
                <span style={{ color: ACCENT, fontSize: '13px', fontWeight: 500 }}>Video Ready</span>
              </div>
              <a href={videoUrl} target="_blank" rel="noreferrer" download style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: ACCENT, color: BG, borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', fontFamily: 'inherit' }}>
                <Download style={{ width: '13px', height: '13px' }} />Download
              </a>
            </div>
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              autoPlay
              playsInline
              style={{ width: '100%', borderRadius: '10px', background: '#000', display: 'block', maxHeight: aspectRatio === '9:16' ? '500px' : '480px', margin: '0 auto', aspectRatio: aspectRatio === '9:16' ? '9/16' : aspectRatio === '1:1' ? '1/1' : '16/9' }}
            />
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="vx-heading" style={{ fontSize: '20px', color: '#fff' }}>RECENT VIDEOS</h2>
              <button onClick={() => { setHistory([]); localStorage.removeItem('vortex_history'); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>
                <Trash2 style={{ width: '13px', height: '13px' }} />Clear all
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
              {history.map(item => (
                <div key={item.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ background: '#000', aspectRatio: '16/9' }}>
                    <video
                      src={item.videoUrl}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      muted playsInline preload="metadata"
                      onMouseEnter={e => (e.target as HTMLVideoElement).play().catch(() => {})}
                      onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                    />
                  </div>
                  <div style={{ padding: '12px' }}>
                    <p style={{ color: '#bbb', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '8px' }}>{item.prompt}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#444', fontSize: '11px' }}>{item.style} · {item.model} · {item.aspectRatio}</span>
                      <a href={item.videoUrl} target="_blank" rel="noreferrer" download style={{ color: ACCENT, lineHeight: 0 }}>
                        <Download style={{ width: '14px', height: '14px' }} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* API Key Modal */}
      {showApiModal && (
        <div onClick={() => setShowApiModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#15151a', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 className="vx-heading" style={{ fontSize: '26px', color: '#fff' }}>REPLICATE API KEY</h3>
              <button onClick={() => setShowApiModal(false)} style={{ background: 'transparent', border: 'none', color: MUTED, cursor: 'pointer', padding: '4px' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <p style={{ color: MUTED, fontSize: '13px', marginBottom: '20px', lineHeight: 1.6 }}>
              Get a free key at <strong style={{ color: '#aaa' }}>replicate.com</strong> — free credits on signup.
              Your key is stored only in your browser&apos;s localStorage, never on any server.
            </p>
            <input
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              placeholder="r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              style={{ width: '100%', padding: '12px 14px', background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', color: '#fff', fontSize: '13px', fontFamily: 'monospace', outline: 'none', marginBottom: '14px', transition: 'border-color 0.15s' }}
              onFocus={e => { e.target.style.borderColor = ACCENT; }}
              onBlur={e => { e.target.style.borderColor = BORDER; }}
              onKeyDown={e => { if (e.key === 'Enter') saveKey(); }}
              autoFocus
            />
            {apiKey && (
              <button onClick={() => { localStorage.removeItem('vortex_api_key'); setApiKey(''); setApiKeyInput(''); }} style={{ display: 'block', width: '100%', padding: '10px', background: 'transparent', border: '1px solid rgba(255,70,70,0.2)', borderRadius: '8px', color: '#ff6666', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '10px' }}>
                Remove saved key
              </button>
            )}
            <button onClick={saveKey} style={{ display: 'block', width: '100%', padding: '14px', background: ACCENT, color: BG, border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Save API Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
