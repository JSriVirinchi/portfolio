import { type FormEvent, useEffect, useRef, useState } from 'react';
import { PORTFOLIO as D } from '../data/portfolio';
import { s } from '../lib/css';
import { createController } from '../lib/portfolioController';
import { sendContactMessage } from '../api/client';
import { useProfile } from '../hooks/useProfile';
import { GithubHeatmap } from './GithubHeatmap';

const NAV = [
  { href: '#work', label: 'Work' },
  { href: '#education', label: 'Education' },
  { href: '#spotlight', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#certifications', label: 'Certs' },
  { href: '#featured', label: 'Community' },
  { href: '#github', label: 'GitHub' },
  { href: '#contact', label: 'Contact' },
];
const MENU = [
  { href: '#work', label: 'Work' },
  { href: '#education', label: 'Education' },
  { href: '#spotlight', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#certifications', label: 'Certifications' },
  { href: '#featured', label: 'Community' },
  { href: '#github', label: 'GitHub' },
  { href: '#contact', label: 'Contact' },
];

const linkStyle = 'display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:999px;font-weight:600;text-decoration:none;color:#e8ecf7;border:1px solid rgba(255,255,255,.14);background:rgba(15,21,42,.4)';
const primaryBtn = 'display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:999px;font-weight:700;text-decoration:none;color:#0a1126;background:linear-gradient(120deg,#7da3ff,#4c7ff9);box-shadow:0 10px 24px rgba(76,127,249,.32)';

function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [note, setNote] = useState('');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      setStatus('sending');
      await sendContactMessage({
        name: String(fd.get('name') || ''),
        email: String(fd.get('email') || ''),
        message: String(fd.get('message') || ''),
      });
      setStatus('success');
      setNote('Thanks for reaching out — I’ll get back to you soon.');
      form.reset();
    } catch {
      setStatus('error');
      setNote('Something went wrong. Please email me directly.');
    }
  };

  const labelS = s("display:flex;flex-direction:column;gap:6px;font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(180,196,235,.7)");
  const inputS = s("font-family:'Inter',sans-serif;font-size:.98rem;color:#eaf0ff;background:rgba(5,7,18,.7);border:1px solid rgba(124,160,255,.22);border-radius:11px;padding:12px 14px;outline:none");

  return (
    <form
      data-reveal
      onSubmit={onSubmit}
      style={s('min-width:0;display:flex;flex-direction:column;gap:14px;padding:clamp(24px,3vw,34px);border-radius:24px;border:1px solid rgba(124,160,255,.2);background:linear-gradient(160deg,rgba(13,18,40,.78),rgba(8,11,26,.7));box-shadow:0 30px 70px rgba(6,10,26,.4)')}
    >
      <label style={labelS}>Name
        <input type="text" name="name" required minLength={2} placeholder="Your name" style={inputS} />
      </label>
      <label style={labelS}>Email
        <input type="email" name="email" required placeholder="you@company.com" style={inputS} />
      </label>
      <label style={labelS}>Message
        <textarea name="message" rows={4} required minLength={10} placeholder="What would you like to build?" style={{ ...inputS, resize: 'vertical' }} />
      </label>
      <button
        type="submit"
        disabled={status === 'sending'}
        style={s("margin-top:4px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 22px;border:none;border-radius:999px;font-family:'Inter',sans-serif;font-weight:700;font-size:.95rem;color:#0a1126;cursor:pointer;background:linear-gradient(120deg,#7da3ff,#4c7ff9);box-shadow:0 10px 24px rgba(76,127,249,.32)")}
      >
        {status === 'sending' ? 'Sending…' : 'Send message →'}
      </button>
      {status !== 'idle' && status !== 'sending' && (
        <p style={s('margin:0;font-size:.86rem;color:' + (status === 'success' ? 'rgba(130,230,190,.95)' : 'rgba(255,150,150,.95)'))}>{note}</p>
      )}
    </form>
  );
}

export default function Portfolio() {
  const { data: profile } = useProfile();
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const expSectionRef = useRef<HTMLElement>(null);
  const expStickyRef = useRef<HTMLDivElement>(null);
  const expTrackRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const ctrlRef = useRef<ReturnType<typeof createController> | null>(null);

  useEffect(() => {
    if (
      !rootRef.current || !canvasRef.current || !parallaxRef.current || !expSectionRef.current ||
      !expStickyRef.current || !expTrackRef.current || !timelineRef.current || !typedRef.current ||
      !mobileMenuRef.current || !burgerRef.current
    ) return;
    const ctrl = createController({
      root: rootRef.current,
      canvas: canvasRef.current,
      parallax: parallaxRef.current,
      expSection: expSectionRef.current,
      expSticky: expStickyRef.current,
      expTrack: expTrackRef.current,
      timeline: timelineRef.current,
      typed: typedRef.current,
      mobileMenu: mobileMenuRef.current,
      burger: burgerRef.current,
      statements: D.statements,
      expCount: D.experience.length,
    });
    ctrlRef.current = ctrl;
    return () => { ctrl.destroy(); ctrlRef.current = null; };
  }, []);

  const closeMenu = () => ctrlRef.current?.closeMenu();
  const sectionLabel = (n: string, label: string) => (
    <div data-reveal style={s('display:flex;align-items:baseline;gap:16px')}>
      <span style={s("font-family:'JetBrains Mono',monospace;font-size:clamp(1.9rem,4vw,2.8rem);font-weight:700;color:rgba(124,160,255,.24);line-height:1")}>{n}</span>
      <span style={s("font-family:'JetBrains Mono',monospace;font-size:.76rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(150,180,255,.85)")}>{label}</span>
    </div>
  );

  return (
    <div style={s('position:relative;min-height:100vh;z-index:0')}>
      <canvas ref={canvasRef} style={s('position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none')} />
      <div style={s('position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(circle at 22% 12%, rgba(120,162,255,.18), transparent 46%), radial-gradient(circle at 84% 86%, rgba(124,92,255,.14), transparent 52%)')} />

      {/* layered tech parallax */}
      <div ref={parallaxRef} style={s('position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden')}>
        <div data-par="0.08" style={s('position:absolute;left:-7vw;top:6vh;width:46vw;height:46vw;border:1px solid rgba(124,160,255,.06);border-radius:50%')} />
        <div data-par="0.12" style={s('position:absolute;right:-10vw;bottom:-6vh;width:38vw;height:38vw;border:1px solid rgba(124,92,255,.05);border-radius:50%')} />
        <div data-par="0.16" style={s('position:absolute;left:7%;top:16%;width:2px;height:36vh;background:linear-gradient(180deg,transparent,rgba(124,160,255,.22),transparent)')} />
        <div data-par="0.24" style={s('position:absolute;right:9%;top:24%;width:32vw;max-width:380px;height:2px;background:linear-gradient(90deg,transparent,rgba(124,160,255,.2),transparent)')} />
        <div data-par="0.38" style={s("position:absolute;left:21%;top:22%;width:54px;height:54px;border:1px solid rgba(124,160,255,.16);border-radius:12px;display:grid;place-items:center;background:rgba(11,15,36,.25)")}><span style={s("font-family:'JetBrains Mono',monospace;font-size:.85rem;color:rgba(159,192,255,.4)")}>λ</span></div>
        <div data-par="0.3" style={s("position:absolute;left:11%;bottom:28%;width:92px;height:92px;border:1px solid rgba(124,160,255,.18);border-radius:16px;display:grid;place-items:center;background:rgba(11,15,36,.3)")}><span style={s("font-family:'JetBrains Mono',monospace;font-size:1.2rem;color:rgba(159,192,255,.4)")}>&lt;/&gt;</span></div>
        <div data-par="0.46" style={s("position:absolute;right:15%;bottom:25%;width:64px;height:64px;border:1px solid rgba(124,160,255,.26);border-radius:13px;display:grid;place-items:center;background:rgba(11,15,36,.35)")}><span style={s("font-family:'JetBrains Mono',monospace;font-size:.95rem;color:rgba(159,192,255,.5)")}>{'{ }'}</span></div>
        <div data-par="0.5" style={s('position:absolute;right:25%;top:33%;width:10px;height:10px;border-radius:50%;background:rgba(159,192,255,.55);box-shadow:0 0 18px rgba(124,160,255,.8)')} />
        <div data-par="0.42" style={s('position:absolute;left:30%;bottom:18%;width:7px;height:7px;border-radius:50%;background:rgba(159,192,255,.45);box-shadow:0 0 14px rgba(124,160,255,.6)')} />
      </div>

      {/* nav */}
      <header style={s('position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:14px clamp(18px,4vw,48px);background:rgba(5,6,15,.6);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid rgba(124,160,255,.12)')}>
        <a href="#hero" style={s('display:inline-flex;align-items:center;gap:12px;text-decoration:none;color:inherit')}>
          <span style={s("display:grid;place-items:center;width:40px;height:40px;border-radius:11px;font-family:'JetBrains Mono',monospace;font-size:.9rem;font-weight:600;color:#eaf0ff;background:linear-gradient(135deg,#7da3ff,#6248ff);box-shadow:0 6px 16px rgba(76,92,255,.35),inset 0 1px 0 rgba(255,255,255,.25)")}>SV</span>
          <span style={s('font-weight:700;letter-spacing:-.01em;font-size:1rem;white-space:nowrap')}>Satya<span style={s('color:rgba(170,186,235,.6);font-weight:500')}> Virinchi</span></span>
        </a>
        <nav className="pf-nav-links" style={s('gap:20px')}>
          {NAV.map((l) => (
            <a key={l.href} href={l.href} className="pf-nav-link" style={s("font-family:'JetBrains Mono',monospace;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(211,222,255,.72);text-decoration:none;transition:color .2s ease")}>{l.label}</a>
          ))}
        </nav>
        <div className="pf-nav-cta" style={s('align-items:center;gap:10px')}>
          <a href={D.linkedin} target="_blank" rel="noreferrer" style={s('display:inline-flex;align-items:center;justify-content:center;padding:9px 16px;border-radius:999px;font-size:.82rem;font-weight:600;text-decoration:none;color:#e8ecf7;border:1px solid rgba(255,255,255,.18);background:rgba(15,21,42,.5)')}>LinkedIn</a>
          <a href={D.resume} target="_blank" rel="noreferrer" style={s('display:inline-flex;align-items:center;justify-content:center;padding:9px 18px;border-radius:999px;font-size:.82rem;font-weight:700;text-decoration:none;color:#0a1126;background:linear-gradient(120deg,#7da3ff,#4c7ff9);box-shadow:0 8px 22px rgba(76,127,249,.32)')}>Resume</a>
        </div>
        <button ref={burgerRef} className="pf-burger" onClick={() => ctrlRef.current?.toggleMenu()} aria-label="Menu" style={s('flex-direction:column;justify-content:center;gap:5px;width:44px;height:44px;padding:0 11px;border:1px solid rgba(124,160,255,.22);border-radius:11px;background:rgba(15,21,42,.5);cursor:pointer')}>
          <span data-bl style={s('display:block;height:2px;border-radius:2px;background:#dbe4ff;transition:transform .3s ease,opacity .3s ease')} />
          <span data-bl style={s('display:block;height:2px;border-radius:2px;background:#dbe4ff;transition:transform .3s ease,opacity .3s ease')} />
          <span data-bl style={s('display:block;height:2px;border-radius:2px;background:#dbe4ff;transition:transform .3s ease,opacity .3s ease')} />
        </button>
      </header>

      {/* mobile menu */}
      <div ref={mobileMenuRef} style={s('position:fixed;inset:0;z-index:49;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:90px clamp(28px,8vw,48px) 48px;background:rgba(5,6,15,.94);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);opacity:0;pointer-events:none;transform:translateY(-12px);transition:opacity .35s ease,transform .35s ease')}>
        {MENU.map((l, i) => (
          <a key={l.href} href={l.href} onClick={closeMenu} style={s("font-family:'JetBrains Mono',monospace;font-size:1.3rem;font-weight:600;letter-spacing:.02em;color:#eef2ff;text-decoration:none;padding:11px 0;border-bottom:1px solid rgba(124,160,255,.12)")}>
            <span style={s('color:rgba(124,160,255,.6);font-size:.85rem')}>{String(i + 1).padStart(2, '0')} </span>{l.label}
          </a>
        ))}
        <div style={s('display:flex;gap:12px;margin-top:28px')}>
          <a href={D.linkedin} target="_blank" rel="noreferrer" onClick={closeMenu} style={s('flex:1;text-align:center;padding:14px;border-radius:999px;font-weight:600;text-decoration:none;color:#e8ecf7;border:1px solid rgba(255,255,255,.2);background:rgba(15,21,42,.5)')}>LinkedIn</a>
          <a href={D.resume} target="_blank" rel="noreferrer" onClick={closeMenu} style={s('flex:1;text-align:center;padding:14px;border-radius:999px;font-weight:700;text-decoration:none;color:#0a1126;background:linear-gradient(120deg,#7da3ff,#4c7ff9)')}>Resume</a>
        </div>
      </div>

      <main ref={rootRef}>
        {/* intro splash */}
        <section id="hero" style={s('position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:120px clamp(22px,5vw,64px) 80px')}>
          <div data-reveal style={s('max-width:900px;display:flex;flex-direction:column;align-items:center;gap:24px;width:100%')}>
            <span style={s("font-family:'JetBrains Mono',monospace;font-size:.74rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(150,180,255,.9);border:1px solid rgba(124,160,255,.3);padding:7px 16px;border-radius:999px")}>📍 Seattle, WA · Software Engineer</span>
            <h1 style={s('margin:0;font-size:clamp(2.4rem,6vw,4.6rem);line-height:1.04;letter-spacing:-.025em;font-weight:800;color:#fff')}>
              Hi, I&rsquo;m Virinchi.
              <span style={s('display:block')}>Passionate about <span style={s('background:linear-gradient(120deg,rgb(159,192,255),rgb(124,92,255));-webkit-background-clip:text;background-clip:text;color:transparent')}>AI.</span></span>
            </h1>
            <p style={s('margin:0;font-size:clamp(1.05rem,1.6vw,1.3rem);color:rgba(210,220,255,.8);max-width:62ch')}>Software Development Engineer at AWS working on EC2 Auto Scaling. I am driven by a passion for building impactful, world-class AI solutions.</p>
          </div>
          <div style={s("margin-top:30px;display:flex;flex-direction:column;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(170,190,235,.72)")}>
            <span>scroll to enter</span>
            <span style={s('font-size:1.2rem;animation:aviHint 1.6s ease-in-out infinite')}>↓</span>
          </div>
        </section>

        {/* hero grid */}
        <section style={s('position:relative;z-index:1;min-height:100vh;display:flex;align-items:center;padding:96px clamp(22px,5vw,64px) 60px')}>
          <div className="pf-hero-grid" style={s('width:100%;max-width:1240px;margin:0 auto;display:grid;gap:clamp(28px,5vw,72px);align-items:center')}>
            <div style={s('min-width:0;display:flex;flex-direction:column;gap:18px')}>
              <p style={s("margin:0;font-family:'JetBrains Mono',monospace;font-size:.78rem;letter-spacing:.26em;text-transform:uppercase;color:rgba(235,238,255,.66);animation:aviUp .7s cubic-bezier(.22,.61,.36,1) both")}>📍 {D.location}</p>
              <h1 style={s("margin:0;font-size:clamp(1.5rem,3.2vw,2.4rem);line-height:1.1;letter-spacing:-.02em;font-weight:800;color:#fff;animation:aviUp .8s cubic-bezier(.22,.61,.36,1) .08s both")}>{D.name}</h1>
              <span style={s('display:block;width:150px;height:6px;border-radius:999px;background:linear-gradient(90deg,#89b4ff,#7c5cff);animation:aviUp .8s cubic-bezier(.22,.61,.36,1) .16s both')} />
              <p style={s('margin:6px 0 0;font-size:clamp(1.05rem,1.7vw,1.35rem);font-weight:600;color:rgba(220,228,255,.92);animation:aviUp .8s cubic-bezier(.22,.61,.36,1) .22s both')}>{D.headline}</p>
              <p style={s("margin:0;font-family:'JetBrains Mono',monospace;font-size:clamp(1rem,1.5vw,1.25rem);color:rgba(129,198,255,.95);line-height:1.4;min-height:2.8em;animation:aviUp .8s cubic-bezier(.22,.61,.36,1) .28s both")}>I <span ref={typedRef} /><span style={s('display:inline-block;margin-left:.15em;color:rgba(129,198,255,.95);animation:aviBlink 1.1s steps(2,start) infinite')}>▌</span></p>
              <p style={s('margin:0;font-size:1.02rem;color:rgba(220,228,255,.7);max-width:54ch;animation:aviUp .8s cubic-bezier(.22,.61,.36,1) .34s both')}>Currently building personal AI assistants and exploring the intersection of cloud infrastructure, 3D rendering, and modern frontend — shipping fast, learning constantly.</p>
              <div className="pf-hero-cta" style={s('display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;animation:aviUp .8s cubic-bezier(.22,.61,.36,1) .4s both')}>
                <a href={D.resume} target="_blank" rel="noreferrer" style={s('display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:999px;font-weight:700;text-decoration:none;color:#0a1126;background:linear-gradient(120deg,#7da3ff,#4c7ff9);box-shadow:0 12px 28px rgba(76,127,249,.34)')}>View Resume →</a>
                <a href={D.linkedin} target="_blank" rel="noreferrer" style={s('display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:999px;font-weight:600;text-decoration:none;color:#e8ecf7;border:1px solid rgba(255,255,255,.22);background:rgba(15,21,42,.55)')}>Connect on LinkedIn</a>
                <a href={D.mailto} style={s('display:inline-flex;align-items:center;gap:8px;padding:13px 22px;border-radius:999px;font-weight:600;text-decoration:none;color:#e8ecf7;border:1px solid rgba(255,255,255,.14);background:rgba(15,21,42,.4)')}>✉ Email</a>
              </div>
              <div style={s('display:flex;flex-wrap:wrap;gap:9px;margin-top:10px;animation:aviUp .8s cubic-bezier(.22,.61,.36,1) .46s both')}>
                {D.specialties.map((spec) => (
                  <span key={spec} style={s('font-size:.8rem;color:rgba(210,220,255,.82);border:1px solid rgba(255,255,255,.12);background:rgba(12,17,38,.55);padding:6px 14px;border-radius:999px')}>{spec}</span>
                ))}
              </div>
            </div>

            {/* ambient terminal */}
            <div className="pf-term" style={s('min-width:0;align-self:center;opacity:.62;transform:perspective(1200px) rotateY(-9deg);animation:aviUp 1s cubic-bezier(.22,.61,.36,1) .5s both')}>
              <div style={s('border-radius:16px;border:1px solid rgba(124,160,255,.18);background:linear-gradient(160deg,rgba(9,13,30,.9),rgba(5,7,16,.82));box-shadow:0 30px 70px rgba(6,10,26,.5);overflow:hidden')}>
                <div style={s('display:flex;align-items:center;gap:7px;padding:12px 16px;border-bottom:1px solid rgba(124,160,255,.1)')}>
                  <span style={s('width:11px;height:11px;border-radius:999px;background:#ff5f56')} />
                  <span style={s('width:11px;height:11px;border-radius:999px;background:#ffbd2e')} />
                  <span style={s('width:11px;height:11px;border-radius:999px;background:#27c93f')} />
                  <span style={s("margin-left:8px;font-family:'JetBrains Mono',monospace;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(192,205,255,.5)")}>~ /career — boot.sh</span>
                </div>
                <div style={s("padding:18px 18px 22px;font-family:'JetBrains Mono',monospace;font-size:.82rem;line-height:1.7;display:flex;flex-direction:column;gap:4px")}>
                  <p style={s('margin:0;color:rgba(144,190,255,.95)')}><span style={s('color:rgba(105,164,255,.7)')}>$</span> whoami</p>
                  <p style={s('margin:0;color:rgba(198,210,244,.78)')}>satya_virinchi · sde @ aws ec2 auto scaling</p>
                  <p style={s('margin:0;color:rgba(144,190,255,.95)')}><span style={s('color:rgba(105,164,255,.7)')}>$</span> cat focus.txt</p>
                  <p style={s('margin:0;color:rgba(198,210,244,.78)')}>resilient cloud-native systems</p>
                  <p style={s('margin:0;color:rgba(130,230,190,.92)')}>✓ shipping across all aws regions</p>
                  <p style={s('margin:0;color:rgba(144,190,255,.95)')}><span style={s('color:rgba(105,164,255,.7)')}>$</span> <span style={s('display:inline-block;width:.5rem;animation:aviBlink 1s steps(2,start) infinite')}>▌</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="pf-section-divider" />

        {/* 01 · the work — pinned horizontal dolly */}
        <section id="work" ref={expSectionRef} style={s('position:relative;z-index:1')}>
          <div ref={expStickyRef} style={s('position:sticky;top:0;height:100vh;overflow:hidden;display:flex;flex-direction:column')}>
            <div style={s('position:absolute;top:0;left:0;right:0;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:clamp(80px,12vh,120px) clamp(24px,6vw,120px) 0;pointer-events:none')}>
              <div style={s('display:flex;flex-direction:column;gap:4px')}>
                <span style={s("font-family:'JetBrains Mono',monospace;font-size:.74rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(150,180,255,.85)")}>01 — The Work</span>
                <span style={s('font-size:clamp(1.4rem,2.4vw,2rem);font-weight:700;letter-spacing:-.01em;color:#f6f8ff')}>Five chapters, one trajectory</span>
              </div>
              <span style={s("font-family:'JetBrains Mono',monospace;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(170,190,235,.5)")}>scroll ↓</span>
            </div>

            <div ref={expTrackRef} style={s('display:flex;flex-direction:row;width:500vw;height:100vh;will-change:transform')}>
              {D.experience.map((role) => (
                <div key={role.no} style={s('flex:none;width:100vw;height:100vh;display:flex;align-items:center;padding:0 clamp(24px,6vw,120px);position:relative')}>
                  <span style={s("position:absolute;top:clamp(70px,14vh,140px);right:clamp(20px,5vw,90px);font-family:'JetBrains Mono',monospace;font-size:clamp(7rem,20vw,18rem);font-weight:700;line-height:.8;color:rgba(124,160,255,.05);pointer-events:none;user-select:none")}>{role.no}</span>
                  <div data-xp-grid style={s('position:relative;z-index:1;width:100%;max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:clamp(28px,5vw,72px);align-items:center;transform-origin:center;will-change:opacity,transform')}>
                    <div style={s('min-width:0;display:flex;flex-direction:column;gap:16px')}>
                      <div style={s('display:flex;align-items:center;gap:16px')}>
                        <span style={s('display:grid;place-items:center;width:64px;height:64px;border-radius:16px;background:#fff;overflow:hidden;box-shadow:0 12px 30px rgba(6,10,26,.45);flex:none')}><img src={role.logo} alt={role.company} style={s('width:100%;height:100%;object-fit:contain;padding:8px')} /></span>
                        <div style={s('display:flex;flex-direction:column;gap:3px')}>
                          <span style={s("font-family:'JetBrains Mono',monospace;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(150,180,255,.85)")}>{role.period}</span>
                          <span style={s('font-size:.82rem;color:rgba(190,204,240,.6)')}>{role.tag}</span>
                        </div>
                      </div>
                      <h3 style={s('margin:0;font-size:clamp(1.8rem,3.4vw,2.8rem);line-height:1.04;letter-spacing:-.015em;font-weight:800;color:#fff')}>{role.company}</h3>
                      <p style={s('margin:0;font-size:1.1rem;font-weight:600;color:rgba(220,228,255,.9)')}>{role.title}</p>
                    </div>
                    <div style={s('min-width:0;display:flex;flex-direction:column;gap:24px')}>
                      {role.metrics.length > 0 && (
                        <div style={s('display:flex;flex-wrap:wrap;gap:clamp(18px,3vw,40px)')}>
                          {role.metrics.map((m) => (
                            <div key={m.label} style={s('display:flex;flex-direction:column;gap:2px;min-width:0')}>
                              <span data-count data-target={m.value} data-suffix={m.suffix} style={s('font-size:clamp(2rem,4vw,3.1rem);font-weight:800;letter-spacing:-.02em;line-height:1;background:linear-gradient(120deg,#9fc0ff,#7c5cff);-webkit-background-clip:text;background-clip:text;color:transparent')}>{m.display}</span>
                              <span style={s('font-size:.8rem;color:rgba(200,212,255,.62);max-width:18ch')}>{m.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <ul style={s('margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px')}>
                        {role.highlights.map((line) => (
                          <li key={line} style={s('display:flex;gap:12px;font-size:.98rem;color:rgba(214,224,255,.82);line-height:1.55')}><span style={s('flex:none;margin-top:.55em;width:6px;height:6px;border-radius:999px;background:linear-gradient(120deg,#89b4ff,#7c5cff)')} /><span>{line}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* timeline scrubber */}
            <div ref={timelineRef} style={s('position:absolute;left:0;right:0;bottom:clamp(28px,6vh,56px);z-index:5;display:flex;justify-content:center;padding:0 clamp(24px,6vw,120px)')}>
              <div style={s('position:relative;width:100%;max-width:1180px')}>
                <div style={s('position:absolute;left:0;right:0;top:7px;height:2px;border-radius:999px;background:rgba(124,160,255,.16)')} />
                <div data-tl-fill style={s('position:absolute;left:0;top:7px;height:2px;width:0%;border-radius:999px;background:linear-gradient(90deg,#89b4ff,#7c5cff);transition:width .12s linear;box-shadow:0 0 12px rgba(124,160,255,.6)')} />
                <div style={s('position:relative;display:flex;justify-content:space-between')}>
                  {D.experience.map((role, i) => (
                    <button key={role.no} data-tl-tick data-idx={i} style={s('display:flex;flex-direction:column;align-items:center;gap:10px;background:none;border:none;cursor:pointer;padding:0;color:inherit')}>
                      <span data-tl-dot style={s('width:16px;height:16px;border-radius:999px;background:#0b1024;border:2px solid rgba(124,160,255,.4);transition:all .25s ease')} />
                      <span data-tl-label style={s("font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.06em;color:rgba(180,196,235,.5);transition:color .25s ease;white-space:nowrap")}>{role.short} {role.year}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="pf-section-divider" />

        {/* 02 · foundations */}
        <section id="education" style={s('position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:110px clamp(22px,5vw,64px)')}>
          <div style={s('width:100%;max-width:1180px;margin:0 auto')}>
            {sectionLabel('02', 'Foundations')}
            <h2 data-reveal style={s('margin:14px 0 0;font-size:clamp(2rem,4vw,3rem);letter-spacing:-.02em;font-weight:800;color:#f6f8ff;max-width:20ch')}>Two degrees, one throughline.</h2>
            <p data-reveal style={s('margin:12px 0 0;font-size:1.08rem;color:rgba(210,220,255,.74);max-width:58ch')}>From mechanical engineering at BITS Pilani to a 4.0 master&rsquo;s in Information Technology at Arizona State.</p>
            <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px;margin-top:46px')}>
              {D.education.map((ed) => (
                <div key={ed.school} data-reveal style={s('display:flex;flex-direction:column;gap:18px;padding:30px;border-radius:28px;border:1px solid rgba(124,160,255,.16);background:linear-gradient(160deg,rgba(13,18,40,.72),rgba(8,11,26,.6));box-shadow:0 24px 54px rgba(6,10,26,.34)')}>
                  <div style={s('display:flex;align-items:center;gap:16px')}>
                    <span style={s('display:grid;place-items:center;width:60px;height:60px;border-radius:14px;background:#fff;overflow:hidden;flex:none;box-shadow:0 10px 24px rgba(6,10,26,.4)')}><img src={ed.logo} alt={ed.school} style={s('width:100%;height:100%;object-fit:contain;padding:9px')} /></span>
                    <div style={s('min-width:0;display:flex;flex-direction:column;gap:3px')}>
                      <h3 style={s('margin:0;font-size:1.3rem;font-weight:800;color:#fff;line-height:1.15')}>{ed.school}</h3>
                      <span style={s('font-size:.98rem;color:rgba(220,228,255,.82)')}>{ed.degree}</span>
                    </div>
                  </div>
                  <div style={s('display:flex;flex-wrap:wrap;align-items:center;gap:10px')}>
                    <span style={s("font-family:'JetBrains Mono',monospace;font-size:.74rem;letter-spacing:.08em;color:rgba(150,180,255,.85)")}>{ed.period}</span>
                    <span style={s('color:rgba(160,176,220,.5)')}>·</span>
                    <span style={s('font-size:.85rem;color:rgba(190,204,240,.62)')}>{ed.location}</span>
                    <span style={s("margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:.74rem;font-weight:600;color:#0a1126;background:linear-gradient(120deg,#9fc0ff,#7c5cff);padding:5px 12px;border-radius:999px")}>GPA {ed.gpa}</span>
                  </div>
                  <div style={s('height:1px;background:rgba(124,160,255,.12)')} />
                  <span style={s("font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(170,190,235,.55)")}>Coursework</span>
                  <div style={s('display:flex;flex-wrap:wrap;gap:8px')}>
                    {ed.coursework.map((course) => (
                      <span key={course} style={s('font-size:.82rem;color:rgba(210,220,255,.82);border:1px solid rgba(124,160,255,.18);background:rgba(12,17,38,.5);padding:6px 12px;border-radius:9px')}>{course}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="pf-section-divider" />

        {/* 03 · selected work */}
        <section id="spotlight" style={s('position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:110px clamp(22px,5vw,64px)')}>
          <div style={s('width:100%;max-width:1180px;margin:0 auto')}>
            {sectionLabel('03', 'Selected Work')}
            <h2 data-reveal style={s('margin:14px 0 0;font-size:clamp(2rem,4vw,3rem);letter-spacing:-.02em;font-weight:800;color:#f6f8ff;max-width:20ch')}>Six builds worth a closer look.</h2>
            <p data-reveal style={s('margin:12px 0 0;font-size:1.08rem;color:rgba(210,220,255,.74);max-width:58ch')}>From global cloud rollouts to conversational AI and NLP research — the projects behind the metrics.</p>
            <div data-carousel="spotlight" style={s('position:relative;width:100vw;margin-left:calc(50% - 50vw);margin-top:clamp(30px,4vw,48px)')}>
              <div data-carousel-stage style={s('position:relative;height:clamp(460px,58vh,540px);perspective:1800px')}>
                <div data-carousel-track style={s('position:absolute;inset:0')}>
                  {D.spotlight.map((proj) => (
                    <article key={proj.title} data-card style={s('position:absolute;left:50%;top:50%;height:100%;box-sizing:border-box;border-radius:30px;border:1px solid rgba(124,160,255,.2);background:linear-gradient(160deg,rgba(16,22,46,.94),rgba(8,11,26,.92));box-shadow:0 40px 90px rgba(5,9,24,.6);overflow:hidden;transform:translate(-50%,-50%);transition:transform .7s cubic-bezier(.4,0,.15,1),width .7s cubic-bezier(.4,0,.15,1),opacity .55s ease,filter .55s ease;cursor:pointer;will-change:transform,width')}>
                      <div data-card-inner style={s('position:absolute;inset:0;opacity:1;transition:opacity .55s ease,transform .6s cubic-bezier(.4,0,.15,1);will-change:opacity,transform;display:flex;box-sizing:border-box;padding:0;gap:0;align-items:stretch')}>
                        <div style={{ ...s('flex:0 0 40%;min-width:0;position:relative;overflow:hidden'), background: proj.accent }}><img src={proj.image} alt={proj.title} style={s('position:absolute;inset:0;width:100%;height:100%;object-fit:cover')} /></div>
                        <div data-divider style={s('flex:0 0 1px;align-self:stretch;background:linear-gradient(180deg,transparent,rgba(124,160,255,.32),transparent)')} />
                        <div data-card-body style={s('flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:16px;justify-content:center;padding:clamp(26px,3vw,46px)')}>
                          <span style={s("align-self:flex-start;font-family:'JetBrains Mono',monospace;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(150,180,255,.85);border:1px solid rgba(124,160,255,.24);padding:5px 12px;border-radius:999px")}>{proj.category}</span>
                          <h3 style={s('margin:0;font-size:clamp(1.6rem,2.8vw,2.4rem);line-height:1.08;letter-spacing:-.015em;font-weight:800;color:#fff')}>{proj.title}</h3>
                          <div style={s('display:flex;flex-wrap:wrap;gap:7px')}>
                            {proj.tags.map((tag) => (
                              <span key={tag} style={s("font-family:'JetBrains Mono',monospace;font-size:.7rem;letter-spacing:.04em;color:rgba(200,212,255,.7);border:1px solid rgba(124,160,255,.2);padding:4px 10px;border-radius:999px")}>{tag}</span>
                            ))}
                          </div>
                          <p style={s('margin:0;font-size:.98rem;color:rgba(208,218,248,.78);line-height:1.55')}>{proj.description}</p>
                        </div>
                      </div>
                      <div data-card-mini style={s('position:absolute;inset:0;opacity:0;transition:opacity .55s ease,transform .6s cubic-bezier(.4,0,.15,1);will-change:opacity,transform;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:16px;box-sizing:border-box;padding:30px 18px;text-align:center')}>
                        <div style={{ ...s('width:54px;height:54px;border-radius:15px;display:grid;place-items:center;overflow:hidden'), background: proj.accent }}><img src={proj.image} alt={proj.title} style={s('max-width:64%;max-height:64%;object-fit:contain')} /></div>
                        <span style={s("font-family:'JetBrains Mono',monospace;font-size:.64rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(150,180,255,.7)")}>{proj.category}</span>
                        <h3 style={s('margin:0;font-size:1.1rem;font-weight:700;color:#eef2ff;line-height:1.25')}>{proj.title}</h3>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <div style={s('display:flex;align-items:center;justify-content:center;gap:22px;margin-top:clamp(22px,3vw,34px)')}>
                <button data-carousel-prev aria-label="Previous" className="pf-cf-btn" style={s('display:grid;place-items:center;width:52px;height:52px;border-radius:999px;border:1px solid rgba(124,160,255,.28);background:rgba(15,21,42,.6);color:#dbe4ff;font-size:1.3rem;cursor:pointer;transition:transform .2s ease,background .2s ease,border-color .2s ease')}>‹</button>
                <div data-carousel-dots style={s('display:flex;align-items:center;gap:10px')} />
                <button data-carousel-next aria-label="Next" className="pf-cf-btn" style={s('display:grid;place-items:center;width:52px;height:52px;border-radius:999px;border:1px solid rgba(124,160,255,.28);background:rgba(15,21,42,.6);color:#dbe4ff;font-size:1.3rem;cursor:pointer;transition:transform .2s ease,background .2s ease,border-color .2s ease')}>›</button>
              </div>
            </div>
          </div>
        </section>

        <hr className="pf-section-divider" />

        {/* 04 · toolkit */}
        <section id="skills" style={s('position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:110px clamp(22px,5vw,64px)')}>
          <div style={s('width:100%;max-width:1180px;margin:0 auto')}>
            {sectionLabel('04', 'Toolkit')}
            <h2 data-reveal style={s('margin:14px 0 0;font-size:clamp(2rem,4vw,3rem);letter-spacing:-.02em;font-weight:800;color:#f6f8ff;max-width:20ch')}>The stack behind the work.</h2>
            <p data-reveal style={s('margin:12px 0 0;font-size:1.08rem;color:rgba(210,220,255,.74);max-width:58ch')}>Languages, frameworks, cloud and ML tooling — organized, not dumped.</p>
            <div className="pf-skills-grid" style={s('display:grid;grid-auto-rows:1fr;gap:20px;margin-top:46px;align-items:stretch')}>
              {D.skillGroups.map((grp) => (
                <div key={grp.name} data-reveal style={s('display:flex;flex-direction:column;gap:16px;padding:26px;border-radius:26px;border:1px solid rgba(124,160,255,.14);background:linear-gradient(165deg,rgba(15,20,42,.66),rgba(9,12,28,.58))')}>
                  <div style={s('display:flex;align-items:center;gap:10px')}><span style={s('width:8px;height:8px;border-radius:999px;background:linear-gradient(120deg,#89b4ff,#7c5cff);box-shadow:0 0 10px rgba(124,160,255,.7)')} /><span style={s("font-family:'JetBrains Mono',monospace;font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(190,205,255,.85)")}>{grp.name}</span></div>
                  <div style={s('display:flex;flex-wrap:wrap;gap:9px')}>
                    {grp.items.map((sk) => (
                      <span key={sk.name} data-chip style={s('display:inline-flex;align-items:center;gap:8px;font-size:.84rem;color:rgba(214,224,255,.86);border:1px solid rgba(124,160,255,.2);background:rgba(12,17,38,.55);padding:7px 13px;border-radius:999px')}>
                        {sk.icon && <img src={sk.icon} alt={sk.name} style={s('width:18px;height:18px;object-fit:contain;filter:drop-shadow(0 0 8px rgba(108,162,255,.3))')} />}
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="pf-section-divider" />

        {/* 05 · credentials */}
        <section id="certifications" style={s('position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:110px clamp(22px,5vw,64px)')}>
          <div style={s('width:100%;max-width:1180px;margin:0 auto')}>
            {sectionLabel('05', 'Credentials')}
            <h2 data-reveal style={s('margin:14px 0 0;font-size:clamp(2rem,4vw,3rem);letter-spacing:-.02em;font-weight:800;color:#f6f8ff;max-width:20ch')}>AWS-verified, top to bottom.</h2>
            <p data-reveal style={s('margin:12px 0 0;font-size:1.08rem;color:rgba(210,220,255,.74);max-width:58ch')}>Generative AI Developer (Professional) and Solutions Architect (Associate) — verifiable on Credly.</p>
            <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:22px;margin-top:46px')}>
              {D.certifications.map((cert) => (
                <a key={cert.name} href={cert.url} target="_blank" rel="noreferrer" data-reveal className="pf-cert-card" style={s('display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:24px;padding:30px;border-radius:26px;border:1px solid rgba(124,160,255,.16);background:linear-gradient(165deg,rgba(15,20,42,.72),rgba(9,12,28,.62));box-shadow:0 20px 44px rgba(6,10,26,.3);text-decoration:none;color:inherit;transition:transform .3s ease,border-color .3s ease,box-shadow .3s ease')}>
                  <div style={s('display:grid;place-items:center;min-width:0')}><img src={cert.image} alt={cert.name} style={s('width:100%;max-width:200px;aspect-ratio:1;object-fit:contain;filter:drop-shadow(0 10px 26px rgba(108,162,255,.35))')} /></div>
                  <div style={s('min-width:0;display:flex;flex-direction:column;gap:9px')}>
                    <h3 style={s('margin:0;font-size:1.12rem;font-weight:700;color:#fff;line-height:1.25')}>{cert.name}</h3>
                    <span style={s('font-size:.86rem;color:rgba(200,212,255,.62)')}>{cert.issuer}</span>
                    <span style={s("margin-top:2px;font-family:'JetBrains Mono',monospace;font-size:.74rem;letter-spacing:.06em;color:rgba(150,180,255,.9)")}>Verify on Credly →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <hr className="pf-section-divider" />

        {/* 06 · community */}
        <section id="featured" style={s('position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:110px clamp(22px,5vw,64px)')}>
          <div style={s('width:100%;max-width:1180px;margin:0 auto')}>
            {sectionLabel('06', 'In the Community')}
            <h2 data-reveal style={s('margin:14px 0 0;font-size:clamp(2rem,4vw,3rem);letter-spacing:-.02em;font-weight:800;color:#f6f8ff;max-width:20ch')}>Where the work showed up.</h2>
            <p data-reveal style={s('margin:12px 0 0;font-size:1.08rem;color:rgba(210,220,255,.74);max-width:58ch')}>Hackathons, startup challenges and community features across the industry.</p>
            <div data-carousel="featured" style={s('position:relative;width:100vw;margin-left:calc(50% - 50vw);margin-top:clamp(30px,4vw,48px)')}>
              <div data-carousel-stage style={s('position:relative;height:clamp(380px,48vh,460px);perspective:1800px')}>
                <div data-carousel-track style={s('position:absolute;inset:0')}>
                  {D.featured.map((feat) => (
                    <article key={feat.title} data-card style={s('position:absolute;left:50%;top:50%;height:100%;box-sizing:border-box;border-radius:30px;border:1px solid rgba(124,160,255,.2);background:linear-gradient(160deg,rgba(16,22,46,.94),rgba(8,11,26,.92));box-shadow:0 40px 90px rgba(5,9,24,.6);overflow:hidden;transform:translate(-50%,-50%);transition:transform .7s cubic-bezier(.4,0,.15,1),width .7s cubic-bezier(.4,0,.15,1),opacity .55s ease,filter .55s ease;cursor:pointer;will-change:transform,width')}>
                      <div data-card-inner style={s('position:absolute;inset:0;opacity:1;transition:opacity .55s ease,transform .6s cubic-bezier(.4,0,.15,1);will-change:opacity,transform;display:flex;box-sizing:border-box;padding:0;gap:0;align-items:stretch')}>
                        <div data-card-title style={s('flex:0 0 44%;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:14px;padding:clamp(26px,3vw,46px)')}>
                          <span style={s("align-self:flex-start;display:inline-flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(150,180,255,.85);border:1px solid rgba(124,160,255,.24);padding:5px 12px;border-radius:999px")}>{feat.source}</span>
                          <h3 style={s('margin:0;font-size:clamp(1.4rem,2.4vw,2rem);line-height:1.2;letter-spacing:-.015em;font-weight:800;color:#fff')}>{feat.title}</h3>
                        </div>
                        <div data-divider style={s('flex:0 0 1px;align-self:stretch;background:linear-gradient(180deg,transparent,rgba(124,160,255,.32),transparent)')} />
                        <div data-card-body style={s('flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:18px;justify-content:center;padding:clamp(26px,3vw,46px)')}>
                          <p style={s('margin:0;font-size:1.05rem;color:rgba(208,218,248,.8);line-height:1.5')}>{feat.subtitle}</p>
                          <a href={feat.url} target="_blank" rel="noreferrer" style={s('align-self:flex-start;display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:999px;font-weight:700;text-decoration:none;color:#0a1126;background:linear-gradient(120deg,#7da3ff,#4c7ff9);box-shadow:0 12px 28px rgba(76,127,249,.32)')}>View post →</a>
                        </div>
                      </div>
                      <div data-card-mini style={s('position:absolute;inset:0;opacity:0;transition:opacity .55s ease,transform .6s cubic-bezier(.4,0,.15,1);will-change:opacity,transform;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:14px;box-sizing:border-box;padding:30px 18px;text-align:center')}>
                        <span style={s("font-family:'JetBrains Mono',monospace;font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(150,180,255,.7);border:1px solid rgba(124,160,255,.24);padding:4px 10px;border-radius:999px")}>{feat.source}</span>
                        <h3 style={s('margin:0;font-size:1.02rem;font-weight:700;color:#eef2ff;line-height:1.25')}>{feat.title}</h3>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <div style={s('display:flex;align-items:center;justify-content:center;gap:22px;margin-top:clamp(22px,3vw,34px)')}>
                <button data-carousel-prev aria-label="Previous" className="pf-cf-btn" style={s('display:grid;place-items:center;width:52px;height:52px;border-radius:999px;border:1px solid rgba(124,160,255,.28);background:rgba(15,21,42,.6);color:#dbe4ff;font-size:1.3rem;cursor:pointer;transition:transform .2s ease,background .2s ease,border-color .2s ease')}>‹</button>
                <div data-carousel-dots style={s('display:flex;align-items:center;gap:10px')} />
                <button data-carousel-next aria-label="Next" className="pf-cf-btn" style={s('display:grid;place-items:center;width:52px;height:52px;border-radius:999px;border:1px solid rgba(124,160,255,.28);background:rgba(15,21,42,.6);color:#dbe4ff;font-size:1.3rem;cursor:pointer;transition:transform .2s ease,background .2s ease,border-color .2s ease')}>›</button>
              </div>
            </div>
          </div>
        </section>

        <hr className="pf-section-divider" />

        {/* 07 · contributions */}
        <section id="github" style={s('position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:110px clamp(22px,5vw,64px)')}>
          <div style={s('width:100%;max-width:1180px;margin:0 auto')}>
            {sectionLabel('07', 'Open Source')}
            <h2 data-reveal style={s('margin:14px 0 0;font-size:clamp(2rem,4vw,3rem);letter-spacing:-.02em;font-weight:800;color:#f6f8ff;max-width:20ch')}>Contributions, in green.</h2>
            <p data-reveal style={s('margin:12px 0 0;font-size:1.08rem;color:rgba(210,220,255,.74);max-width:58ch')}>Building in public since 2020 — here&rsquo;s the rhythm of the work, and the languages it&rsquo;s written in.</p>
            <div data-reveal style={s('margin-top:42px;padding:clamp(22px,3vw,30px);border-radius:28px;border:1px solid rgba(124,160,255,.16);background:linear-gradient(160deg,rgba(13,18,40,.7),rgba(8,11,26,.6));box-shadow:0 24px 54px rgba(6,10,26,.34)')}>
              <div style={s('display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px')}>
                <span style={s("font-family:'JetBrains Mono',monospace;font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(190,205,255,.78)")}>Contribution activity</span>
                <a href={D.github} target="_blank" rel="noreferrer" style={s('display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:999px;font-weight:700;font-size:.86rem;text-decoration:none;color:#0a1126;background:linear-gradient(120deg,#7da3ff,#4c7ff9);box-shadow:0 12px 28px rgba(76,127,249,.32)')}>Explore GitHub →</a>
              </div>
              <div style={s('margin-top:20px')}>
                <GithubHeatmap profile={profile} />
              </div>
            </div>
            <div data-reveal style={s('margin-top:26px;display:flex;flex-wrap:wrap;gap:18px 24px;align-items:center;justify-content:space-between')}>
              <div style={s('display:flex;flex-wrap:wrap;align-items:center;gap:9px')}>
                <span style={s("font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(170,190,235,.55)")}>Most used</span>
                {D.languages.map((lang) => (
                  <span key={lang.name} style={s('display:inline-flex;align-items:center;gap:7px;font-size:.82rem;color:rgba(214,224,255,.86);border:1px solid rgba(124,160,255,.2);background:rgba(12,17,38,.55);padding:6px 12px;border-radius:999px')}><img src={lang.icon} alt={lang.name} style={s('width:16px;height:16px;object-fit:contain')} />{lang.name}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <hr className="pf-section-divider" />

        {/* contact */}
        <section id="contact" style={s('position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:96px clamp(22px,5vw,64px)')}>
          <div className="pf-contact-grid" data-reveal style={s('width:100%;max-width:1100px;margin:0 auto;display:grid;gap:clamp(32px,5vw,72px);align-items:center')}>
            <div data-reveal style={s('min-width:0;display:flex;flex-direction:column;gap:18px')}>
              <span style={s("font-family:'JetBrains Mono',monospace;font-size:.76rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(150,180,255,.85)")}>08 — Let&rsquo;s build</span>
              <h2 style={s('margin:0;font-size:clamp(2.2rem,5vw,3.4rem);letter-spacing:-.02em;font-weight:800;color:#fff;line-height:1.05')}>Let&rsquo;s build something<br /><span style={s('background:linear-gradient(120deg,#9fc0ff,#7c5cff);-webkit-background-clip:text;background-clip:text;color:transparent')}>resilient together.</span></h2>
              <p style={s('margin:0;font-size:1.08rem;color:rgba(210,220,255,.74);max-width:46ch')}>Open to conversations about cloud-native products, automation, and data-informed UX. Send a note, or reach me directly.</p>
              <div style={s('display:flex;flex-wrap:wrap;gap:10px;margin-top:4px')}>
                <a href={D.mailto} style={s(primaryBtn)}>✉ Email</a>
                <a href={D.linkedin} target="_blank" rel="noreferrer" style={s('display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:999px;font-weight:600;text-decoration:none;color:#e8ecf7;border:1px solid rgba(255,255,255,.22);background:rgba(15,21,42,.55)')}>LinkedIn</a>
                <a href={D.github} target="_blank" rel="noreferrer" style={s(linkStyle)}>GitHub</a>
                <a href={D.resume} target="_blank" rel="noreferrer" style={s(linkStyle)}>Resume</a>
              </div>
              <p style={s("margin:14px 0 0;font-family:'JetBrains Mono',monospace;font-size:.72rem;letter-spacing:.06em;color:rgba(170,190,235,.45)")}>{D.email} · {D.phone} · {D.location}</p>
            </div>
            <ContactForm />
          </div>
        </section>

        {/* footer */}
        <footer style={s('position:relative;z-index:1;border-top:1px solid rgba(124,160,255,.12);padding:40px clamp(22px,5vw,64px);background:rgba(5,6,15,.5)')}>
          <div style={s('max-width:1180px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px')}>
            <div style={s('display:flex;flex-direction:column;gap:6px')}>
              <span style={s('font-weight:700;letter-spacing:-.01em;color:#eef2ff')}>{D.name}</span>
              <span style={s("font-family:'JetBrains Mono',monospace;font-size:.74rem;color:rgba(180,196,235,.55)")}>© 2026 · Built &amp; designed by Satya Virinchi</span>
            </div>
            <div style={s('display:flex;flex-direction:column;gap:8px;align-items:flex-end')}>
              <span style={s("font-family:'JetBrains Mono',monospace;font-size:.7rem;letter-spacing:.06em;color:rgba(170,190,235,.5)")}>Crafted with</span>
              <div style={s('display:flex;flex-wrap:wrap;gap:7px;justify-content:flex-end')}>
                {['React', 'TypeScript', 'Vite', 'AWS'].map((t) => (
                  <span key={t} style={s("font-family:'JetBrains Mono',monospace;font-size:.72rem;color:rgba(200,212,255,.78);border:1px solid rgba(124,160,255,.2);background:rgba(12,17,38,.55);padding:5px 12px;border-radius:999px")}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
