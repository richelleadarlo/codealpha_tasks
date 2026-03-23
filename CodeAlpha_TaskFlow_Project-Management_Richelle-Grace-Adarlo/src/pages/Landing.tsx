import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, Sparkles, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="bento-card mb-6 flex items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-blue-500/30">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-foreground">TaskFlow</p>
              <p className="text-xs text-muted-foreground">Project management, reimagined</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            {user ? (
              <Link to="/dashboard" className="btn-primary px-4 py-2">
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-xl border border-border/70 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </header>

        <main className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="bento-card relative h-full overflow-hidden p-6 lg:col-span-6 lg:p-5">
            <div className="pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full bg-cyan-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-indigo-400/25 blur-3xl" />

            <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-background/70 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Team productivity platform
            </span>

            <h1 className="max-w-2xl text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
              Turn tasks into momentum with a clean bento-style workflow.
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">
              Plan projects, run boards, and track team progress in one focused workspace that feels modern in both light and charcoal dark themes.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={user ? '/dashboard' : '/register'} className="btn-primary px-5 py-2.5 text-sm">
                {user ? 'Go to dashboard' : 'Create free account'}
              </Link>
              <Link to="/login" className="rounded-xl border border-border/70 bg-card/80 px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
                I already have an account
              </Link>
            </div>
          </section>

          <section className="bento-card aspect-[1586/771] overflow-hidden p-0 lg:col-span-6">
            <div className="relative h-full w-full overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-background/90 via-white/45 to-background/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:from-background/60 dark:via-white/5 dark:to-background/40">
              <img
                src="/mockup.png"
                alt="TaskFlow interface mockup"
                className="h-full w-full rounded-[1.8rem] object-cover"
              />
            </div>
          </section>

          <article className="bento-card p-5 lg:col-span-5">
            <div className="mb-3 flex items-center gap-2 text-foreground">
              <KanbanSquare className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Built for visual project flow</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Organize work into backlog, in progress, and done columns, then drag tasks naturally between stages.
            </p>
          </article>

          <article className="bento-card p-5 lg:col-span-3">
            <div className="mb-3 flex items-center gap-2 text-foreground">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Collaboration first</h2>
            </div>
            <p className="text-sm text-muted-foreground">Invite members, assign owners, and keep task ownership clear.</p>
          </article>

          <article className="bento-card p-5 lg:col-span-4">
            <div className="mb-3 flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Secure auth flow</h2>
            </div>
            <p className="text-sm text-muted-foreground">Separate landing, sign in, and sign up with protected routes for app pages.</p>
          </article>

          <aside className="bento-card p-5 lg:col-span-3 lg:min-h-[170px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Core stack</p>
            <ul className="mt-3 space-y-2 text-sm text-foreground">
              <li className="rounded-xl bg-background/70 px-3 py-2">Kanban boards</li>
              <li className="rounded-xl bg-background/70 px-3 py-2">Task priorities</li>
              <li className="rounded-xl bg-background/70 px-3 py-2">Realtime project members</li>
              <li className="rounded-xl bg-background/70 px-3 py-2">Light and dark UI mode</li>
            </ul>
          </aside>

          <article className="bento-card p-5 lg:col-span-3 lg:min-h-[170px]">
            <div className="rounded-2xl bg-background/70 p-4 h-full">
              <p className="text-2xl font-bold text-foreground">3x</p>
              <p className="text-sm text-muted-foreground">Faster planning cycles</p>
            </div>
          </article>

          <article className="bento-card p-5 lg:col-span-3 lg:min-h-[170px]">
            <div className="rounded-2xl bg-background/70 p-4 h-full">
              <p className="text-2xl font-bold text-foreground">99%</p>
              <p className="text-sm text-muted-foreground">Task visibility across teams</p>
            </div>
          </article>

          <article className="bento-card p-5 lg:col-span-3 lg:min-h-[170px]">
            <div className="rounded-2xl bg-background/70 p-4 h-full">
              <p className="mb-2 text-sm font-semibold text-foreground">What you get immediately</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> Project dashboard</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> Team member controls</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> Personalized profile</p>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
