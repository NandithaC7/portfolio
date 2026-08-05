// One-off dev script: vendors selected React Bits (JS + CSS) component sources
// into src/reactbits/. Run: node scripts/fetch-reactbits.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const COMPONENTS = [
  'SplitText', 'TextType', 'DecryptedText', 'GlitchText', 'ShinyText',
  'Magnet', 'StarBorder', 'ClickSpark', 'TargetCursor', 'GooeyNav',
  'SpotlightCard', 'AnimatedContent', 'ScrollReveal', 'FadeContent',
  'FaultyTerminal', 'Noise',
];

const OUT_ROOT = join(process.cwd(), 'src', 'reactbits');
const deps = new Set();

for (const name of COMPONENTS) {
  const url = `https://reactbits.dev/r/${name}-JS-CSS`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`FAIL ${name}: HTTP ${res.status}`);
      continue;
    }
    const item = await res.json();
    for (const f of item.files || []) {
      const outPath = join(OUT_ROOT, f.path);
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, f.content, 'utf8');
      console.log(`wrote ${f.path}`);
    }
    for (const d of item.dependencies || []) deps.add(d);
  } catch (err) {
    console.error(`ERROR ${name}: ${err.message}`);
  }
}

console.log('\n=== union of dependencies ===');
console.log([...deps].sort().join('\n'));
