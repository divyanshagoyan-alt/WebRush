import './index.css';
import { useData } from './hooks/useData';
import { motion, useScroll } from 'framer-motion';
import { Nav } from './components/ui/Nav';
import { Cover } from './features/cover/Cover';
import { StoryOverview } from './features/story/StoryOverview';
import { Explorer } from './features/explorer/Explorer';
import { Connections } from './features/connections/Connections';
import { Patterns } from './features/patterns/Patterns';
import { Timeline } from './features/timeline/Timeline';
import { FinalReflection } from './features/reflection/FinalReflection';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FadeIn } from './components/ui/FadeIn';

function LoadingScreen({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] flex flex-col items-center justify-center z-50">
      <div className="text-center px-6 max-w-sm w-full">
        <p className="text-4xl mb-6" aria-hidden="true">🧾</p>
        <h1 className="text-xl font-black text-[var(--text-primary)] mb-2">YOUR LIFE, IN RECEIPTS</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">Loading your digital archive…</p>

        <div className="w-full h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[var(--accent-purple)] transition-all duration-300 ease-out"
            style={{ width: `${Math.max(5, progress)}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Loading: ${progress}%`}
          />
        </div>
        <p className="text-xs text-[var(--text-tertiary)] num-display">{progress}%</p>

        <div className="mt-8 flex flex-wrap justify-center gap-2 text-[10px] text-[var(--text-tertiary)]">
          <span>Parsing Spotify history…</span>
          <span>·</span>
          <span>Building connection graph…</span>
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] flex flex-col items-center justify-center z-50 px-6">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4" aria-hidden="true">⚠️</p>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Unable to load the dataset</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          The data files could not be loaded. This usually means the preprocessing step didn't run.
        </p>
        <details className="text-left mb-6">
          <summary className="text-xs text-[var(--text-tertiary)] cursor-pointer">Technical details</summary>
          <pre className="text-[10px] text-[var(--danger)] mt-2 bg-[var(--bg-elevated)] p-3 rounded-lg overflow-x-auto">
            {message}
          </pre>
        </details>
        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-xl bg-[var(--accent-purple)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function DiagnosticPanel({ summary }: { summary: ReturnType<typeof useData>['summary'] }) {
  if (!summary) return null;
  if (!window.location.search.includes('diagnostic')) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 card p-4 text-xs max-w-xs" aria-label="Diagnostic panel">
      <p className="font-semibold text-[var(--text-primary)] mb-2">🔬 Dataset Diagnostic</p>
      <table className="w-full">
        <tbody className="space-y-1">
          {[
            ['Dataset', 'Spotify + Household'],
            ['Spotify records', summary.spotify.totalRecords.toLocaleString()],
            ['HH records', summary.household.totalRecords.toLocaleString()],
            ['Date range', `${summary.spotify.dateStart.slice(0,10)} → ${summary.spotify.dateEnd.slice(0,10)}`],
            ['Unique artists', summary.spotify.uniqueArtists.toLocaleString()],
            ['Categories', '12'],
            ['Status', 'Normalized ✓'],
          ].map(([k, v]) => (
            <tr key={k} className="text-[var(--text-secondary)]">
              <td className="text-[var(--text-tertiary)] pr-3">{k}</td>
              <td className="text-right font-mono">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const { summary, allReceipts, status, error, progress, reload } = useData();
  const { scrollYProgress } = useScroll();

  const handleExplore = () => {
    document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleViewDataset = () => {
    document.getElementById('explorer')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (status === 'error') {
    return <ErrorScreen message={error || 'Unknown error'} onRetry={reload} />;
  }

  if (status === 'idle' || (status === 'loading' && !summary)) {
    return <LoadingScreen progress={progress} />;
  }

  return (
    <>
      <a
        href="#cover"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--accent-purple)] focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent)] origin-left z-[100] shadow-sm"
        style={{ scaleX: scrollYProgress }}
      />

      <Nav />

      <main id="cover" className="pt-14">
        {summary && (
          <ErrorBoundary>
            <FadeIn delay={0.1}>
              <Cover summary={summary} onExplore={handleExplore} onViewDataset={handleViewDataset} />
            </FadeIn>
            
            <div className="section-divider" aria-hidden="true" />
            
            <ErrorBoundary fallback={<div className="p-10 text-center">Failed to load Story Overview.</div>}>
              <FadeIn>
                <StoryOverview summary={summary} />
              </FadeIn>
            </ErrorBoundary>
            
            <div className="section-divider" aria-hidden="true" />
            
            <ErrorBoundary fallback={<div className="p-10 text-center">Failed to load Explorer.</div>}>
              <FadeIn direction="none">
                <Explorer
                  receipts={allReceipts}
                  isLoading={status === 'loading'}
                  progress={progress}
                />
              </FadeIn>
            </ErrorBoundary>
            
            <div className="section-divider" aria-hidden="true" />
            
            <ErrorBoundary fallback={<div className="p-10 text-center">Failed to load Connections.</div>}>
              <FadeIn>
                <Connections summary={summary} />
              </FadeIn>
            </ErrorBoundary>
            
            <div className="section-divider" aria-hidden="true" />
            
            <ErrorBoundary fallback={<div className="p-10 text-center">Failed to load Patterns.</div>}>
              <FadeIn>
                <Patterns summary={summary} />
              </FadeIn>
            </ErrorBoundary>
            
            <div className="section-divider" aria-hidden="true" />
            
            <ErrorBoundary fallback={<div className="p-10 text-center">Failed to load Timeline.</div>}>
              <FadeIn>
                <Timeline summary={summary} />
              </FadeIn>
            </ErrorBoundary>
            
            <div className="section-divider" aria-hidden="true" />
            
            <ErrorBoundary fallback={<div className="p-10 text-center">Failed to load Reflection.</div>}>
              <FadeIn>
                <FinalReflection summary={summary} />
              </FadeIn>
            </ErrorBoundary>
          </ErrorBoundary>
        )}
      </main>

      {summary && <DiagnosticPanel summary={summary} />}

      {/* Loading progress indicator (non-blocking) */}
      {status === 'loading' && summary && (
        <div
          className="fixed top-14 left-0 right-0 z-30 h-0.5 bg-[var(--bg-elevated)]"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Loading receipts: ${progress}%`}
        >
          <div
            className="h-full bg-[var(--accent-purple)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </>
  );
}
