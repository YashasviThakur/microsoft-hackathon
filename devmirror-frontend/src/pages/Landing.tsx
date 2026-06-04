import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Github, Gitlab, Code2, Trophy, Mail, Calendar, Youtube,
  GitCommit, CheckCircle2, ArrowRight, Database, Zap, Shield,
} from 'lucide-react'

// ── Scroll-triggered fade-up (v2) ────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = '' }: {
  children: ReactNode; delay?: number; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className={`${visible ? 'animate-fade-up' : 'opacity-0'} ${className}`}
    >
      {children}
    </div>
  )
}

// ── GitHub contribution grid ───────────────────────────────────────────────
function MockGithubGrid() {
  const [cells, setCells] = useState<number[]>([])
  useEffect(() => {
    setCells(Array.from({ length: 364 }, () =>
      Math.random() < 0.4 ? 0 : Math.floor(Math.random() * 5),
    ))
  }, [])
  const shades = ['bg-[#D8D4CC]', 'bg-[#B4AFA4]', 'bg-[#8A8479]', 'bg-[#4A4540]', 'bg-[#1A1A14]']
  return (
    <div>
      <div className="flex gap-0.5 overflow-hidden">
        {Array.from({ length: 52 }, (_, col) => (
          <div key={col} className="flex flex-col gap-0.5">
            {Array.from({ length: 7 }, (_, row) => {
              const v = cells[col * 7 + row] ?? 0
              const delay = Math.min((col * 7 + row) * 2, 600)
              return (
                <div
                  key={row}
                  style={{ animationDelay: `${delay}ms` }}
                  className={`w-2.5 h-2.5 ${shades[v]} ${cells.length ? 'animate-fade-in' : 'opacity-0'}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-dm-muted font-mono">
        <GitCommit size={11} /> 52 weeks · 364 days tracked
      </div>
    </div>
  )
}

// ── LeetCode rings ────────────────────────────────────────────────────────
function LeetCodeRing({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 28, circ = 2 * Math.PI * r
  const [dash, setDash] = useState(0)
  useEffect(() => { const t = setTimeout(() => setDash((pct / 100) * circ), 400); return () => clearTimeout(t) }, [pct, circ])
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={70} height={70} className="-rotate-90">
        <circle cx={35} cy={35} r={r} fill="none" stroke="#C8C4BC" strokeWidth={5} />
        <circle cx={35} cy={35} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ - dash}
          strokeLinecap="butt" className="transition-all duration-1000 ease-out" />
      </svg>
      <span className="text-[11px] text-dm-muted font-mono">{label}</span>
    </div>
  )
}

// ── Gmail stream ──────────────────────────────────────────────────────────
const MOCK_EMAILS = [
  { from: 'recruiting@stripe.com',  subject: 'Summer 2026 Internship - Backend'  },
  { from: 'devrel@google.com',      subject: 'GSoC 2026 Applications Open'        },
  { from: 'noreply@mlh.io',         subject: 'MLH Fellowship - Apply Now'          },
  { from: 'careers@microsoft.com',  subject: 'New Grad SWE - AI Division'          },
  { from: 'hackathon@devpost.com',  subject: 'Build with AI - $50k in prizes'      },
]
function GmailStream() {
  const [visible, setVisible] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setVisible(v => Math.min(v + 1, MOCK_EMAILS.length)), 700)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="space-y-1">
      {MOCK_EMAILS.slice(0, visible).map((e, i) => (
        <div key={i} className="flex items-center gap-3 text-xs bg-[#EBE7DF] border border-dm-border px-3 py-2.5 animate-slide-up">
          <Mail size={11} className="text-dm-red shrink-0" />
          <span className="text-dm-muted truncate w-28 font-mono">{e.from}</span>
          <span className="text-dm-text truncate flex-1">{e.subject}</span>
        </div>
      ))}
    </div>
  )
}

// ── Terminal ──────────────────────────────────────────────────────────────
const TERMINAL_LINES = [
  '$ devmirror --fetch-all',
  '  -> GitHub     [########--]  3 commits',
  '  -> GitLab     [########--]  8 MRs merged',
  '  -> LeetCode   [########--]  streak: 7d',
  '  -> Codeforces [######----]  rating: 1487',
  '  -> Gmail      [##########]  4 leads',
  '  -> Calendar   [########--]  2 sessions',
  '  -> MongoDB    [##########]  synced',
  '',
  '  * Microsoft Phi-4 coaching...',
  '',
  '  "You\'re building AND solving - that\'s rare."',
  '  "Today\'s nudge: try one System Design read."',
  '  "Consistency beats intensity."',
]
function Terminal() {
  const [lines, setLines] = useState<string[]>([])
  useEffect(() => {
    let cursor = 0
    const t = setInterval(() => {
      if (cursor < TERMINAL_LINES.length) {
        setLines(p => [...p, TERMINAL_LINES[cursor] ?? ''])
        cursor++
      } else {
        clearInterval(t)
      }
    }, 100)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="bg-[#111108] border border-white/10">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="w-3 h-3 rounded-full bg-white/20 transition-colors duration-300 hover:bg-[#FF5F57]" />
        <span className="w-3 h-3 rounded-full bg-white/20 transition-colors duration-300 hover:bg-[#FFBD2E]" />
        <span className="w-3 h-3 rounded-full bg-white/20 transition-colors duration-300 hover:bg-[#28C840]" />
        <span className="ml-3 text-xs text-white/40 font-mono">devmirror - live pipeline</span>
        <span className="ml-auto text-[10px] font-mono px-2 py-0.5 border border-dm-green/50 text-dm-green animate-pulse-slow">live</span>
      </div>
      <div className="p-5 min-h-[300px] font-mono text-sm space-y-0.5">
        {lines.map((line, idx) => {
          const l = typeof line === 'string' ? line : ''
          return (
            <div key={idx} className={
              l.startsWith('  *') ? 'text-white/90 font-semibold mt-2 animate-fade-in' :
              l.startsWith('$')   ? 'text-[#A8D8A8] animate-fade-in' :
              l.startsWith('  "') ? 'text-white/60 pl-2 italic animate-fade-in' :
              l.startsWith('  ->') ? 'text-white/50 pl-2 animate-fade-in' :
              'text-white/70 animate-fade-in'
            }>
              {l || '·'}
            </div>
          )
        })}
        {lines.length < TERMINAL_LINES.length && (
          <span className="inline-block w-2 h-4 bg-white/70 animate-blink" />
        )}
      </div>
    </div>
  )
}

// ── Data sources ticker ───────────────────────────────────────────────────
const SOURCES = [
  { icon: Github,   name: 'GitHub'     },
  { icon: Gitlab,   name: 'GitLab'     },
  { icon: Code2,    name: 'LeetCode'   },
  { icon: Trophy,   name: 'Codeforces' },
  { icon: Mail,     name: 'Gmail'      },
  { icon: Calendar, name: 'Calendar'   },
  { icon: Youtube,  name: 'YouTube'    },
  { icon: Database, name: 'MongoDB'    },
]

const FEATURES = [
  { icon: Zap,      title: 'Daily AI Growth Report',   desc: 'Microsoft Phi-4 analyses all your data sources and delivers a personalised coaching session every morning.' },
  { icon: Calendar, title: 'Closed-Loop Scheduling',   desc: 'Ask the coach to plan your week and it automatically creates Google Calendar events for you.' },
  { icon: Gitlab,   title: 'GitLab Integration',       desc: 'Private repo activity, merge requests, and commit velocity from GitLab alongside GitHub.' },
  { icon: Database, title: 'MongoDB Persistence',      desc: 'User profiles and Fernet-encrypted OAuth tokens stored in MongoDB Atlas — multi-tenant safe from day one.' },
  { icon: Mail,     title: 'Internship Radar',         desc: 'Smart Gmail filter surfaces only internship, hackathon, and recruitment emails — zero noise.' },
  { icon: Shield,   title: 'Multi-Tenant & Encrypted', desc: 'OAuth tokens are Fernet-encrypted at rest. Institution accounts keep every student\'s goals isolated.' },
]

// ── Main ──────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="min-h-screen bg-white text-dm-text overflow-x-hidden">

      {/* Nav */}
      <nav className={`fixed top-0 inset-x-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'bg-white/92 backdrop-blur-md border-dm-border shadow-sm'
          : 'bg-white border-dm-border'
      }`}>
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
          <span className="font-black text-xl tracking-tighter">DevMirror</span>
          <div className="hidden md:flex items-center">
            <div className="w-px h-7 bg-dm-border mx-8" />
            <div className="flex items-center gap-8 text-sm font-medium text-dm-muted">
              <a href="#platforms" className="hover:text-dm-text transition-colors duration-150">Platforms</a>
              <a href="#features"  className="hover:text-dm-text transition-colors duration-150">Features</a>
              <a href="#accounts"  className="hover:text-dm-text transition-colors duration-150">Accounts</a>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#1A1A14] text-white text-sm font-semibold px-5 py-2.5
                       hover:opacity-80 active:scale-95 transition-all duration-150"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#1A1A14] pt-36 pb-28 px-8">
        <div className="max-w-[1400px] mx-auto">
          <FadeUp delay={0}>
            <p className="text-dm-dim text-[11px] font-mono uppercase tracking-widest mb-10">
              Microsoft Phi-4 · GitHub Models · GitHub Copilot · FastAPI · MongoDB · React
            </p>
          </FadeUp>
          <FadeUp delay={120}>
            <h1 className="text-display text-white mb-10 max-w-4xl">
              Built to track.<br />Built to grow.
            </h1>
          </FadeUp>
          <FadeUp delay={280} className="flex flex-col lg:flex-row gap-10 items-start">
            <p className="text-white/55 text-lg font-light leading-relaxed max-w-md">
              DevMirror connects GitHub, GitLab, LeetCode, Codeforces, Gmail, Calendar, and YouTube —
              then sends it all to Microsoft Phi-4 to coach you, schedule your week, and surface real internship leads.
            </p>
            <div className="flex flex-col gap-4 shrink-0">
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="border border-white text-white text-sm font-semibold px-8 py-4
                             hover:bg-white hover:text-[#1A1A14] active:scale-95 transition-all duration-150"
                >
                  Get Started Free
                </button>
                <a
                  href="https://github.com/YashasviThakur/DevMirror"
                  target="_blank" rel="noopener noreferrer"
                  className="border border-white/30 text-white/60 text-sm font-semibold px-8 py-4
                             flex items-center gap-2 hover:border-white/60 hover:text-white/80
                             active:scale-95 transition-all duration-150"
                >
                  <Github size={15} /> Source
                </a>
              </div>
              <div className="flex items-center gap-6 text-[11px] font-mono text-white/35 pt-2">
                <span>8 data sources</span>
                <span className="w-px h-3 bg-white/15" />
                <span>Microsoft Phi-4 Agent</span>
                <span className="w-px h-3 bg-white/15" />
                <span>Free to use</span>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Platforms ticker */}
      <section id="platforms" className="border-b border-dm-border overflow-hidden group">
        <div className="flex animate-ticker whitespace-nowrap select-none group-hover:[animation-play-state:paused]">
          {[...SOURCES, ...SOURCES, ...SOURCES, ...SOURCES].map((s, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 px-10 py-5 border-r border-dm-border
                         text-sm font-medium text-dm-muted shrink-0
                         hover:text-dm-text hover:bg-[#F5F0E8] transition-all duration-150"
            >
              <s.icon size={15} /> {s.name}
            </span>
          ))}
        </div>
      </section>

      {/* Section 1 — GitHub */}
      <section className="bg-[#F5F0E8] py-28 px-8">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <FadeUp delay={0}>
            <div>
              <p className="dm-label mb-6">GitHub Integration</p>
              <h2 className="text-display-md text-dm-text mb-8">
                Every commit,<br />every streak.
              </h2>
              <p className="text-dm-muted text-lg font-light leading-relaxed max-w-md">
                Your full contribution grid, weekly commit count, top repositories, and language
                breakdown — pulled live from the GitHub API and reflected back in one view.
              </p>
              <div className="flex items-center gap-2 mt-6 text-sm font-medium">
                <CheckCircle2 size={15} className="text-dm-green" />
                <span className="text-dm-muted">Public repos · Commit events · Language stats</span>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={160}>
            <div className="bg-[#EBE7DF] border border-dm-border p-8">
              <div className="dm-label mb-6">Contribution Grid - Last 52 Weeks</div>
              <MockGithubGrid />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Section 2 — AI Coach */}
      <section className="bg-[#1A1A14] py-28 px-8">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <FadeUp delay={160} className="order-2 lg:order-1">
            <Terminal />
          </FadeUp>
          <FadeUp delay={0} className="order-1 lg:order-2">
            <div>
              <p className="dm-label text-dm-dim mb-6">Microsoft Phi-4 · GitHub Models · MongoDB</p>
              <h2 className="text-display-md text-white mb-8">
                AI that coaches,<br />not just reports.
              </h2>
              <p className="text-white/55 text-lg font-light leading-relaxed max-w-md">
                Ask the coach to plan your week and it creates Google Calendar events automatically.
                Every day starts with a personalised session built from your real data — stored and synced via MongoDB.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Section 3 — LeetCode + Gmail */}
      <section className="bg-white py-28 px-8">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20 items-start">
          <FadeUp delay={0}>
            <div>
              <p className="dm-label mb-6">LeetCode & Codeforces</p>
              <h2 className="text-display-md text-dm-text mb-8">
                Problems solved,<br />streaks alive.
              </h2>
              <p className="text-dm-muted text-lg font-light leading-relaxed mb-10">
                Ring charts, streak counters, difficulty breakdowns, and Codeforces rating —
                all in one DSA progress view.
              </p>
              <div className="bg-[#F5F0E8] border border-dm-border p-8">
                <div className="flex items-center justify-around">
                  <LeetCodeRing pct={45} color="#2D6A4F" label="Easy"   />
                  <LeetCodeRing pct={36} color="#B45309" label="Medium" />
                  <LeetCodeRing pct={18} color="#CC2200" label="Hard"   />
                </div>
                <div className="flex items-center justify-center gap-2 mt-6 text-xs text-dm-muted font-mono">
                  <CheckCircle2 size={11} className="text-dm-green" /> 7-day streak active
                </div>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={160}>
            <div>
              <p className="dm-label mb-6">Gmail Radar</p>
              <h2 className="text-display-md text-dm-text mb-8">
                Internships,<br />surfaced daily.
              </h2>
              <p className="text-dm-muted text-lg font-light leading-relaxed mb-10">
                Smart Gmail filter isolates internship, hackathon, and recruitment emails
                from the noise — categorised and action-flagged automatically.
              </p>
              <div className="bg-[#F5F0E8] border border-dm-border p-6">
                <div className="dm-label mb-4">Live opportunity stream</div>
                <GmailStream />
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Section 4 — GitLab */}
      <section className="bg-[#F5F0E8] py-28 px-8">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <FadeUp delay={0}>
            <div>
              <p className="dm-label mb-6">GitLab Integration</p>
              <h2 className="text-display-md text-dm-text mb-8">
                Private repos,<br />fully visible.
              </h2>
              <p className="text-dm-muted text-lg font-light leading-relaxed max-w-md">
                GitLab merge requests, commit activity, and project stats — pulled alongside GitHub
                so your full dev picture is captured, not just the public half.
              </p>
              <div className="flex flex-col gap-3 mt-8">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 size={15} className="text-dm-green" />
                  <span className="text-dm-muted">Merge requests · Commit velocity · Private repos</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 size={15} className="text-dm-green" />
                  <span className="text-dm-muted">PAT-authenticated · Works alongside GitHub</span>
                </div>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={160}>
            <div className="bg-[#EBE7DF] border border-dm-border p-8 space-y-3">
              <div className="dm-label mb-4">GitLab · Recent activity</div>
              {[
                { action: 'Merged MR',      detail: 'feat: add OAuth refresh logic',    time: '2h ago'  },
                { action: 'Pushed commit',  detail: 'fix: handle 401 on token expiry',  time: '5h ago'  },
                { action: 'Opened MR',      detail: 'chore: upgrade python deps',       time: '1d ago'  },
                { action: 'Pushed commit',  detail: 'perf: batch MongoDB writes',       time: '2d ago'  },
              ].map((row, i) => (
                <div
                  key={i}
                  style={{ animationDelay: `${160 + i * 70}ms` }}
                  className="flex items-center gap-3 bg-[#F5F0E8] border border-dm-border px-4 py-3
                             hover:bg-white transition-colors duration-150 animate-slide-up"
                >
                  <Gitlab size={12} className="text-dm-muted shrink-0" />
                  <span className="text-xs font-mono text-dm-muted w-24 shrink-0">{row.action}</span>
                  <span className="text-xs text-dm-text flex-1 truncate">{row.detail}</span>
                  <span className="text-[11px] font-mono text-dm-dim shrink-0">{row.time}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="bg-white py-28 px-8">
        <div className="max-w-[1400px] mx-auto">
          <FadeUp delay={0}>
            <div className="mb-16">
              <p className="dm-label mb-5">Platform Capabilities</p>
              <h2 className="text-display-md text-dm-text max-w-2xl">
                Hardworking tools<br />for serious devs.
              </h2>
            </div>
          </FadeUp>
          <FadeUp delay={100}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-dm-border border border-dm-border">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-[#F5F0E8] p-8 hover:bg-[#EBE7DF] transition-all duration-200 group cursor-default"
                >
                  <Icon size={18} className="text-dm-text mb-6 transition-transform duration-200 group-hover:scale-110" />
                  <h3 className="font-bold text-base leading-tight tracking-tight mb-3">{title}</h3>
                  <p className="text-sm text-dm-muted font-light leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Account tiers */}
      <section id="accounts" className="bg-[#F5F0E8] py-28 px-8">
        <div className="max-w-[1400px] mx-auto">
          <FadeUp delay={0}>
            <div className="mb-16">
              <p className="dm-label mb-5">Account Types</p>
              <h2 className="text-display-md text-dm-text">
                Individual or<br />institutional.
              </h2>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-6">
            <FadeUp delay={0}>
              <div className="bg-[#1A1A14] p-10 flex flex-col h-full
                              hover:-translate-y-1 transition-transform duration-200">
                <p className="dm-label text-dm-dim mb-6">Personal</p>
                <h3 className="font-black text-3xl text-white tracking-tight mb-5 leading-tight">
                  Track your<br />individual growth.
                </h3>
                <p className="text-white/55 font-light leading-relaxed mb-10 flex-1">
                  Set 3 personal focus goals, connect all eight data sources, and get a daily AI
                  coaching session tailored to exactly where you are right now.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="self-start border border-white text-white text-sm font-semibold px-6 py-3
                             hover:bg-white hover:text-[#1A1A14] active:scale-95
                             transition-all duration-150 flex items-center gap-2"
                >
                  Get Started <ArrowRight size={14} />
                </button>
              </div>
            </FadeUp>

            <FadeUp delay={120}>
              <div className="bg-white border border-dm-border p-10 flex flex-col h-full
                              hover:-translate-y-1 transition-transform duration-200">
                <p className="dm-label mb-6">Institutional</p>
                <h3 className="font-black text-3xl text-dm-text tracking-tight mb-5 leading-tight">
                  For colleges<br />and bootcamps.
                </h3>
                <p className="text-dm-muted font-light leading-relaxed mb-10 flex-1">
                  Register under your institution name. Each student's OAuth tokens remain
                  individually isolated and Fernet-encrypted. Track cohort progress as a unit.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="self-start border border-dm-text text-dm-text text-sm font-semibold px-6 py-3
                             hover:bg-dm-text hover:text-white active:scale-95
                             transition-all duration-150 flex items-center gap-2"
                >
                  Sign in as Institution <ArrowRight size={14} />
                </button>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#F04E00] py-28 px-8">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <FadeUp delay={0}>
            <h2 className="text-display text-white">
              Start your<br />growth story.
            </h2>
          </FadeUp>
          <FadeUp delay={150}>
            <div>
              <p className="text-white/70 text-lg font-light leading-relaxed mb-10 max-w-md">
                One click. Your entire developer journey — GitHub, GitLab, LeetCode, Codeforces,
                Gmail, Calendar, YouTube — reflected back with Microsoft Phi-4 AI coaching.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="border border-white text-white text-sm font-semibold px-8 py-4
                           hover:bg-white hover:text-[#F04E00] active:scale-95
                           transition-all duration-150 flex items-center gap-2"
              >
                Get Started — it's free <ArrowRight size={14} />
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A14] border-t border-white/10 px-8 py-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-black text-white text-xl tracking-tighter">DevMirror</span>
          <span className="text-dm-dim text-xs font-mono">
            Microsoft Agents League 2026 · Phi-4 · GitHub Models · GitHub Copilot · FastAPI · React · MongoDB
          </span>
        </div>
      </footer>
    </div>
  )
}
