import { useState } from 'react';
import { Menu, X, Receipt } from 'lucide-react';

const NAV_ITEMS = [
  { href: '#cover',       label: 'Home' },
  { href: '#story',       label: 'Story' },
  { href: '#explorer',    label: 'Explore' },
  { href: '#connections', label: 'Connections' },
  { href: '#patterns',    label: 'Patterns' },
  { href: '#timeline',    label: 'Timeline' },
  { href: '#reflection',  label: 'About' },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 glass border-b border-[var(--border)]"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <a
          href="#cover"
          className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm hover:text-[var(--accent-purple)] transition-colors"
          aria-label="Your Life, In Receipts — home"
        >
          <Receipt size={16} className="text-[var(--accent-purple)]" />
          <span className="hidden sm:inline">YOUR LIFE, IN RECEIPTS</span>
          <span className="sm:hidden">YL:IR</span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1" role="list">
          {NAV_ITEMS.map(item => (
            <li key={item.href}>
              <a
                href={item.href}
                className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Dataset pill */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] text-[var(--text-tertiary)] border border-[var(--border)] rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--positive)]" aria-hidden="true" />
          Real data · No fabrication
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(v => !v)}
          className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[var(--bg-secondary)] border-t border-[var(--border)] px-4 py-3">
          <ul className="space-y-1" role="list">
            {NAV_ITEMS.map(item => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
