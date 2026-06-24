import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Footer from '../components/ui/Footer';
import useAuthStore from '../store/authStore';

const features = [
  {
    icon: SparklesIcon,
    title: 'AI-Powered Writing',
    desc: 'Let AI craft bullet points that recruiters love. One click transforms weak phrases into powerful achievements with quantified impact.',
  },
  {
    icon: LayoutIcon,
    title: 'Smart Templates',
    desc: 'Professionally designed, ATS-optimized templates that parse correctly every time. Choose from Modern, Classic, or Minimal layouts.',
  },
  {
    icon: DownloadIcon,
    title: 'Instant PDF Export',
    desc: 'Export pixel-perfect PDFs with one click. Your resume looks exactly as designed, every time — no formatting surprises.',
  },
  {
    icon: EyeIcon,
    title: 'Live Preview',
    desc: 'See changes in real-time as you type. Toggle templates, colors, and font sizes instantly to find your perfect look.',
  },
  {
    icon: TargetIcon,
    title: 'ATS Score Check',
    desc: 'Get instant feedback on how your resume scores against Applicant Tracking Systems. Optimize for every job application.',
  },
  {
    icon: ShareIcon,
    title: 'Share & Export',
    desc: 'Share a live link with recruiters or download as PDF. Your resume, always accessible from anywhere.',
  },
];

const templates = [
  {
    name: 'Modern',
    desc: 'Two-column layout with a colored sidebar — perfect for highlighting skills and contact info.',
    popular: true,
    preview: (
      <div className="flex h-full overflow-hidden rounded-[6px] border border-hairline shadow-inner">
        <div className="w-[35%] bg-canvas-night p-3">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-white/20" />
          <div className="space-y-2">
            {[80, 60, 70].map((w, i) => (
              <div key={i} className="h-1.5 rounded bg-white/20" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="mt-4 space-y-1.5">
            {[1, 1, 1].map((_, i) => (
              <div key={i} className="h-1 rounded bg-white/10" />
            ))}
          </div>
        </div>
        <div className="flex-1 bg-white p-3">
          <div className="mb-2 h-2.5 w-1/2 rounded bg-ink" />
          <div className="mb-3 h-1.5 w-1/3 rounded bg-ink-mute" />
          <div className="space-y-1.5">
            {[100, 90, 80, 95, 85].map((w, i) => (
              <div key={i} className="h-1 rounded" style={{ width: `${w}%`, backgroundColor: i === 0 ? '#3ecf8e' : '#ededed' }} />
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    name: 'Classic',
    desc: 'Traditional single-column layout — the timeless format trusted by recruiters worldwide.',
    preview: (
      <div className="h-full overflow-hidden rounded-[6px] border border-hairline bg-white p-4 shadow-inner">
        <div className="mx-auto mb-3 h-3 w-1/3 rounded bg-ink" />
        <div className="mx-auto mb-3 flex justify-center gap-3">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="h-1 w-10 rounded bg-ink-mute" />
          ))}
        </div>
        <div className="mb-2 h-px bg-hairline" />
        {[100, 90, 85, 95].map((w, i) => (
          <div key={i} className="mt-2 h-1 rounded" style={{ width: `${w}%`, backgroundColor: i === 0 ? '#3ecf8e' : '#ededed' }} />
        ))}
        <div className="my-3 h-px bg-hairline" />
        {[90, 80, 95].map((w, i) => (
          <div key={i} className="mt-2 h-1 rounded" style={{ width: `${w}%`, backgroundColor: '#ededed' }} />
        ))}
      </div>
    ),
  },
  {
    name: 'Minimal',
    desc: 'Clean, whitespace-rich design that lets your content breathe and speak for itself.',
    preview: (
      <div className="h-full overflow-hidden rounded-[6px] border border-hairline bg-white p-4 shadow-inner">
        <div className="mb-4 h-3 w-1/4 rounded bg-ink" />
        <div className="mb-4 flex gap-3">
          <div className="h-1 w-14 rounded bg-ink-mute" />
          <div className="h-1 w-20 rounded bg-ink-mute" />
        </div>
        <div className="mb-3 h-px bg-hairline" />
        <div className="mt-2 h-1 w-full rounded bg-ink-mute" />
        {[90, 85, 95].map((w, i) => (
          <div key={i} className="mt-1.5 h-1 rounded bg-hairline" style={{ width: `${w}%` }} />
        ))}
        <div className="my-3 h-px bg-hairline" />
        <div className="mt-2 h-1 w-3/4 rounded bg-ink-mute" />
        {[80, 90].map((w, i) => (
          <div key={i} className="mt-1.5 h-1 rounded bg-hairline" style={{ width: `${w}%` }} />
        ))}
      </div>
    ),
  },
];

const stats = [
  { value: '10K+', label: 'Resumes Created' },
  { value: '98%', label: 'ATS Pass Rate' },
  { value: '4.9★', label: 'User Rating' },
  { value: '3min', label: 'Avg. Build Time' },
];

export default function Landing() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-hairline-cool bg-canvas">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-hairline bg-canvas">
              <span className="text-sm font-medium text-primary">R</span>
            </div>
            <span className="text-lg font-medium text-ink tracking-tight">Resumind</span>
          </Link>
          <nav className="hidden items-center gap-4 sm:flex">
            <a href="#features" className="text-sm text-ink-mute hover:text-ink transition-colors">Features</a>
            <a href="#templates" className="text-sm text-ink-mute hover:text-ink transition-colors">Templates</a>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-link text-sm">Sign in</Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
          <div className="sm:hidden">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary fade-in-up">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                AI-Powered Resume Builder
              </div>

              <h1 className="text-5xl font-medium leading-[1.1] tracking-[-1.92px] text-ink md:text-6xl lg:text-7xl fade-in-up" style={{ animationDelay: '0.1s' }}>
                Craft resumes that <span className="text-primary">stand out.</span>
                <br />
                Land interviews faster.
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-mute fade-in-up" style={{ animationDelay: '0.2s' }}>
                Build professional, ATS-optimized resumes in minutes. 
                Our AI helps you highlight achievements that get you noticed by recruiters and algorithms alike.
              </p>

              <div className="mt-10 flex items-center justify-center gap-4 fade-in-up" style={{ animationDelay: '0.3s' }}>
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button size="lg">
                      Go to Dashboard
                      <ArrowIcon />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg">
                        Start Building Free
                        <ArrowIcon />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="secondary" size="lg">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-ink-mute fade-in-up" style={{ animationDelay: '0.4s' }}>
                <span className="flex items-center gap-1.5"><MiniCheck /> No credit card</span>
                <span className="flex items-center gap-1.5"><MiniCheck /> ATS optimized</span>
                <span className="flex items-center gap-1.5"><MiniCheck /> Free templates</span>
              </div>
            </div>

            {/* Composited product UI mockup */}
            <div className="relative mx-auto mt-16 max-w-5xl fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="card-floating overflow-hidden p-0 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 text-center text-xs font-medium text-ink-mute">
                    resumind.app — Untitled Resume
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded bg-hairline" />
                    <div className="h-3 w-3 rounded bg-hairline" />
                  </div>
                </div>
                <div className="aspect-[1.414/1] bg-canvas-soft p-8 md:p-12">
                  <div className="mb-6 flex items-center justify-between border-b border-hairline pb-6">
                    <div>
                      <div className="h-8 w-48 rounded-[6px] bg-hairline" />
                      <div className="mt-2 h-4 w-32 rounded bg-hairline-cool" />
                    </div>
                    <div className="flex gap-4">
                      <div className="h-4 w-20 rounded bg-hairline-cool" />
                      <div className="h-4 w-20 rounded bg-hairline-cool" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[80, 60, 40].map((_, i) => (
                      <div key={i}>
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-4 w-24 rounded bg-hairline" />
                          <div className="h-3 flex-1 rounded bg-hairline-cool" />
                        </div>
                        <div className="space-y-1.5">
                          {[...Array(3 - i)].map((_, j) => (
                            <div key={j} className="h-3 rounded bg-hairline-cool" style={{ width: `${70 - j * 15}%` }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-hairline-cool bg-canvas-soft">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-medium text-ink">{stat.value}</p>
                  <p className="mt-1 text-sm text-ink-mute">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="badge-primary mb-4">Everything you need</span>
              <h2 className="text-4xl font-medium text-ink tracking-[-1.44px] md:text-5xl">
                Build resumes that actually work
              </h2>
              <p className="mt-4 leading-relaxed text-ink-mute">
                From AI-powered writing to ATS optimization — every tool you need to create a 
                resume that lands interviews.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <div key={i} className="card p-6">
                  <feature.icon className="mb-4 h-5 w-5 text-primary" />
                  <h3 className="mb-2 text-lg font-medium text-ink">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-mute">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates */}
        <section id="templates" className="border-t border-hairline-cool bg-canvas-soft py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="badge-primary mb-4">Professional Templates</span>
              <h2 className="text-4xl font-medium text-ink tracking-[-1.44px] md:text-5xl">
                Choose your perfect layout
              </h2>
              <p className="mt-4 leading-relaxed text-ink-mute">
                Each template is professionally designed and optimized for ATS parsing. 
                Switch between them instantly — your content stays intact.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {templates.map((tpl, i) => (
                <div key={tpl.name} className="card overflow-hidden p-0">
                  <div className="relative h-56 overflow-hidden bg-canvas-soft">
                    {tpl.preview}
                    {tpl.popular && (
                      <div className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-medium text-on-primary">
                        Popular
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-ink">{tpl.name}</h3>
                    <p className="mt-1 text-sm text-ink-mute">{tpl.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <span className="badge-primary mb-4">Get Started</span>
            <h2 className="text-4xl font-medium text-ink tracking-[-1.44px] md:text-5xl">
              Ready to land your next role?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-mute">
              Join thousands of professionals who built better resumes with Resumind. 
              Start free — no credit card required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg">
                    Go to Dashboard
                    <ArrowIcon />
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button size="lg">
                    Start Building Free
                    <ArrowIcon />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function MiniCheck() {
  return (
    <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function SparklesIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function LayoutIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  );
}

function DownloadIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function EyeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function TargetIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l3 3m0 0l3-3m-3 3V3m0 12v9M3 12h3m15 0h-3m-3 0H6" />
    </svg>
  );
}

function ShareIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  );
}
