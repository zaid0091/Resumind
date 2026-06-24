import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t border-hairline-cool bg-canvas">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link to="/" className="mb-4 inline-flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-hairline bg-canvas">
                <span className="text-sm font-medium text-primary">R</span>
              </div>
              <span className="text-lg font-medium text-ink tracking-tight">Resumind</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-ink-mute">
              AI-powered resume builder. Professional templates, ATS optimization, and smart PDF export — all in one place.
            </p>
          </div>

          {/* Features */}
          <div className="lg:col-span-3">
            <h4 className="mb-6 text-xs font-medium uppercase tracking-wider text-ink-mute">Features</h4>
            <ul className="space-y-3">
              {features.map((item) => (
                <li key={item.name}>
                  <span className="text-sm text-ink-mute hover:text-ink transition-colors cursor-default">
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div className="lg:col-span-3">
            <h4 className="mb-6 text-xs font-medium uppercase tracking-wider text-ink-mute">Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map((item) => (
                <li key={item.name}>
                  <Link to={item.to} className="text-sm text-ink-mute hover:text-ink transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-hairline-cool pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-ink-mute">
              &copy; {new Date().getFullYear()} Resumind. Built for careers.
            </p>
            <a
              href="https://github.com/zaid0091/Resumind"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-ink-mute hover:text-ink transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const features = [
  { name: 'AI Resume Writing' },
  { name: 'ATS Score Optimization' },
  { name: 'Professional Templates' },
  { name: 'Live Preview' },
  { name: 'Smart PDF Export' },
];

const platformLinks = [
  { name: 'Browse Templates', to: '#templates' },
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Terms of Service', to: '/register' },
  { name: 'Privacy Policy', to: '/login' },
];
