import Replicate from 'replicate';
import { NextRequest, NextResponse } from 'next/server';

const MODEL_IDS: Record<string, string> = {
  'wan-2.1': 'wavespeedai/wan-2.1-t2v-480p',
  'ltx-video': 'lightricks/ltx-video',
  'mochi-1': 'genmoai/mochi-1-preview',
};

const STYLE_PREFIXES: Record<string, string> = {
  Cinematic: 'cinematic quality, dramatic lighting, professional cinematography,',
  Neon: 'neon glow, cyberpunk aesthetic, vivid neon colors, futuristic,',
  Realistic: 'photorealistic, hyper-realistic, ultra-detailed, high fidelity,',
  Animated: 'animated style, cartoon, vibrant colors, stylized,',
  Vintage: 'vintage film, retro aesthetic, film grain, old movie look,',
};

const ASPECT_DIMS: Record<string, { width: number; height: number }> = {
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
  '1:1': { width: 1024, height: 1024 },
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, aspectRatio, duration, style, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'Replicate API key required' }, { status: 400 });
    }
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const modelId = MODEL_IDS[model];
    if (!modelId) {
      return NextResponse.json({ error: 'Invalid model selected' }, { status: 400 });
    }

    const stylePrefix = STYLE_PREFIXES[style] ?? '';
    const fullPrompt = stylePrefix ? `${stylePrefix} ${prompt}` : prompt;
    const durationNum = parseInt(duration) || 5;
    const dims = ASPECT_DIMS[aspectRatio] ?? ASPECT_DIMS['16:9'];

    let input: Record<string, unknown>;

    if (model === 'wan-2.1') {
      input = {
        prompt: fullPrompt,
        aspect_ratio: aspectRatio,
        duration: Math.min(durationNum, 5),
      };
    } else if (model === 'ltx-video') {
      input = {
        prompt: fullPrompt,
        width: dims.width,
        height: dims.height,
        num_frames: durationNum * 24,
        frame_rate: 24,
      };
    } else {
      // mochi-1
      input = {
        prompt: fullPrompt,
        num_frames: Math.min(durationNum * 24, 192),
      };
    }

    const replicate = new Replicate({ auth: apiKey });
    const prediction = await replicate.predictions.create({ model: modelId, input });

    return NextResponse.json({ id: prediction.id, status: prediction.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
