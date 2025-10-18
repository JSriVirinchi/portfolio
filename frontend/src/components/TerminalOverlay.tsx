import { useEffect, useRef, useState } from 'react';

type OutputType = 'info' | 'success' | 'progress';

interface ScriptEntry {
  command: string;
  outputs: Array<{
    type: OutputType;
    text: string;
  }>;
}

const script: ScriptEntry[] = [
  {
    command: 'deploy aws/asg --feature bake-time',
    outputs: [
      { type: 'progress', text: 'rolling instances across 4 AZs' },
      { type: 'success', text: '✔ instances stabilized | response latency steady' },
    ],
  },
  {
    command: 'run analytics --org robotics --metric efficiency',
    outputs: [
      { type: 'progress', text: 'aggregating 120k+ datapoints' },
      { type: 'success', text: '↳ +20% ops efficiency across simulation dashboards' },
    ],
  },
  {
    command: 'audit types --mode strict',
    outputs: [
      { type: 'info', text: 'scanning 45 modules for null candidates' },
      { type: 'success', text: '✔ 6000+ null candidates eliminated | coverage 0.90' },
    ],
  },
  {
    command: 'launch chatbot --domain clinical',
    outputs: [
      { type: 'progress', text: 'training empathy heuristics' },
      { type: 'success', text: '↳ 90% scheduling success | GPT+BERT orchestration ready' },
    ],
  },
  {
    command: 'publish dashboard --target leadership',
    outputs: [
      { type: 'info', text: 'rendering impact snapshots for exec audiences' },
      { type: 'success', text: '✔ insights live | subscribed leadership channels updated' },
    ],
  },
];

type LineType = 'command' | OutputType;

interface RenderedLine {
  id: number;
  type: LineType;
  text: string;
}

interface TypingLine {
  type: LineType;
  text: string;
}

export function TerminalOverlay() {
  const [lines, setLines] = useState<RenderedLine[]>([]);
  const [typing, setTyping] = useState<TypingLine | null>(null);
  const lineCounter = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    let cancelled = false;

    const clearTimers = () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };

    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        timers.current = timers.current.filter((stored) => stored !== id);
        if (!cancelled) {
          fn();
        }
      }, delay);
      timers.current.push(id);
    };

    const pushLine = (line: Omit<RenderedLine, 'id'>) => {
      lineCounter.current += 1;
      setLines((prev) => [...prev, { ...line, id: lineCounter.current }]);
    };

    const typeLine = (text: string, type: LineType, done: () => void) => {
      setTyping({ type, text: '' });
      let index = 0;

      const tick = () => {
        index += 1;
        const slice = text.slice(0, index);
        setTyping({ type, text: slice });
        if (index < text.length) {
          schedule(tick, 30 + Math.random() * 30);
        } else {
          schedule(() => {
            pushLine({ type, text });
            setTyping(null);
            done();
          }, 160);
        }
      };

      schedule(tick, 90);
    };

    const playOutputs = (entry: ScriptEntry, idx: number, done: () => void) => {
      if (idx >= entry.outputs.length) {
        schedule(done, 420);
        return;
      }
      const step = entry.outputs[idx];
      typeLine(step.text, step.type, () => {
        const pause = step.type === 'progress' ? 620 : 260;
        schedule(() => playOutputs(entry, idx + 1, done), pause);
      });
    };

    const runBlock = (blockIndex: number) => {
      const entry = script[blockIndex];
      typeLine(entry.command, 'command', () => {
        playOutputs(entry, 0, () => {
          if (blockIndex < script.length - 1) {
            schedule(() => runBlock(blockIndex + 1), 580);
          } else {
            schedule(runClear, 940);
          }
        });
      });
    };

    const runClear = () => {
      typeLine('clear', 'command', () => {
        schedule(() => {
          setLines([]);
          lineCounter.current = 0;
          setTyping(null);
          schedule(() => runBlock(0), 420);
        }, 220);
      });
    };

    schedule(() => runBlock(0), 220);

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, []);

  const renderLine = (line: TypingLine | RenderedLine, key: string | number, isTyping = false) => {
    const classes = ['terminal-line', line.type];
    if (isTyping) {
      classes.push('typing');
    }

    return (
      <p key={key} className={classes.join(' ')}>
        {line.type === 'command' && (
          <span className="terminal-prompt" aria-hidden="true">
            ➜
          </span>
        )}
        {line.type === 'progress' && (
          <span className="terminal-loader" aria-hidden="true" />
        )}
        {isTyping ? (
          <span className="terminal-text typing">
            <span className="terminal-text-content">{line.text || '\u00a0'}</span>
            <span className="terminal-cursor" aria-hidden="true">
              █
            </span>
          </span>
        ) : (
          <span className="terminal-text">
            <span className="terminal-text-content">{line.text}</span>
          </span>
        )}
      </p>
    );
  };

  return (
    <aside className="terminal" aria-label="Live terminal with highlights">
      <div className="terminal-header">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="terminal-title">~/virinchi/impact.log</span>
      </div>
      <div className="terminal-body">
        {lines.map((line) => renderLine(line, line.id))}
        {typing && renderLine(typing, 'typing', true)}
      </div>
    </aside>
  );
}
