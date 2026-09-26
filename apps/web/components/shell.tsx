"use client";

import { useIOS } from "@/components/provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SkeletonList } from "./states";

const NAV = [
  { href: "/home", label: "Home", group: "Search", mobile: "Home" },
  { href: "/opportunities", label: "Opportunities", group: "Search", mobile: "Jobs" },
  { href: "/saved", label: "Saved", group: "Search" },
  { href: "/queue", label: "Apply Queue", group: "Pipeline" },
  { href: "/applications", label: "Applications", group: "Pipeline", mobile: "Applications" },
  { href: "/resume", label: "Resume", group: "Profile" },
  { href: "/networking", label: "Networking", group: "Later", mobile: "Network" },
  { href: "/interview", label: "Interview Prep", group: "Later", mobile: "Prep" },
  { href: "/calendar", label: "Calendar", group: "Later" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const ios = useIOS();
  const [collapsed, setCollapsed] = useState(false);
  const [help, setHelp] = useState(false);
  const [more, setMore] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("ios-sidebar");
    if (stored === "collapsed") setCollapsed(true);
  }, []);

  useEffect(() => {
    if (ios.loading) return;
    if (!ios.profile) router.replace("/login");
    else if (!ios.profile.onboardingComplete) router.replace("/onboarding");
  }, [ios.loading, ios.profile, router]);

  useEffect(() => {
    document.body.dataset.palette = ios.paletteOpen ? "open" : "closed";
  }, [ios.paletteOpen]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        ios.setPaletteOpen(!ios.paletteOpen);
      }
      if (event.key === "?" && !isTyping(event.target)) {
        event.preventDefault();
        setHelp((open) => !open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ios]);

  const commands = useMemo(() => {
    const pages: { id: string; label: string; hint: string; run: () => void }[] = NAV.map((item) => ({
      id: item.href,
      label: item.label,
      hint: "Go",
      run: () => router.push(item.href),
    }));
    pages.push(
      { id: "/analytics", label: "Analytics", hint: "Go", run: () => router.push("/analytics") },
      { id: "/settings", label: "Settings", hint: "Go", run: () => router.push("/settings") },
      { id: "session", label: "Start application session", hint: "Action", run: () => router.push("/queue") },
    );
    const jobs = ios.jobs.slice(0, 8).map((job) => ({
      id: job.id,
      label: `${job.company} — ${job.title}`,
      hint: `${job.match.overall}%`,
      run: () => router.push(`/opportunities?job=${job.id}`),
    }));
    const all = [...pages, ...jobs];
    const q = query.trim().toLowerCase();
    return q ? all.filter((item) => item.label.toLowerCase().includes(q)) : all;
  }, [ios.jobs, query, router]);

  useEffect(() => setActive(0), [query, ios.paletteOpen]);

  if (ios.loading) {
    return (
      <div className="content">
        <SkeletonList count={4} />
      </div>
    );
  }
  if (ios.error) {
    return (
      <div className="content">
        <div className="error-box card" role="alert">
          <h2>We couldn&apos;t load your workspace.</h2>
          <p className="muted">{ios.error}</p>
          <button className="btn btn-primary" onClick={() => ios.refresh()}>Try again</button>
        </div>
      </div>
    );
  }
  if (!ios.profile?.onboardingComplete) return <div className="content"><SkeletonList /></div>;

  const groups = ["Search", "Pipeline", "Profile", "Later"] as const;

  return (
    <div className="shell" data-collapsed={collapsed ? "true" : "false"}>
      <a className="skip" href="#main">Skip to content</a>
      <aside className="sidebar">
        <div className="brand"><span className="mark">IO</span><span>InternshipOS</span></div>
        {groups.map((group) => (
          <div key={group}>
            <div className="nav-label">{group}</div>
            <nav className="nav" aria-label={group}>
              {NAV.filter((item) => item.group === group).map((item) => (
                <a key={item.href} className="nav-item" href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined}>
                  <b aria-hidden="true">{item.label.slice(0, 1)}</b>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
        ))}
        <div className="sidebar-foot">
          <a className="nav-item" href="/analytics" aria-current={pathname.startsWith("/analytics") ? "page" : undefined}><b>A</b><span>Analytics</span></a>
          <a className="nav-item" href="/settings" aria-current={pathname.startsWith("/settings") ? "page" : undefined}><b>S</b><span>Settings</span></a>
          <button
            className="btn btn-ghost"
            onClick={() => {
              const next = !collapsed;
              setCollapsed(next);
              localStorage.setItem("ios-sidebar", next ? "collapsed" : "open");
            }}
          >
            {collapsed ? "»" : "Collapse"}
          </button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="cmdk" onClick={() => ios.setPaletteOpen(true)}>
            Search jobs, queue, resume… <span className="num">⌘K</span>
          </button>
          <button className="icon-btn" aria-label="Keyboard shortcuts" onClick={() => setHelp(true)}>?</button>
          <ThemeButton />
        </header>
        <div className="content" id="main">{children}</div>
      </div>
      <nav className="tabbar" aria-label="Primary">
        {NAV.filter((item) => "mobile" in item).map((item) => (
          <a key={item.href} href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined}>
            {"mobile" in item ? item.mobile : ""}
          </a>
        ))}
        <button onClick={() => setMore(true)}>More</button>
      </nav>
      {more ? (
        <div className="backdrop" onClick={() => setMore(false)}>
          <div className="modal" role="dialog" aria-label="More" onClick={(event) => event.stopPropagation()}>
            {NAV.map((item) => (
              <a key={item.href} className="menu-item" href={item.href} onClick={() => setMore(false)}>{item.label}</a>
            ))}
            <a className="menu-item" href="/analytics">Analytics</a>
            <a className="menu-item" href="/settings">Settings</a>
          </div>
        </div>
      ) : null}
      {ios.paletteOpen ? (
        <div className="backdrop" onClick={() => ios.setPaletteOpen(false)}>
          <div
            className="palette"
            role="dialog"
            aria-label="Command palette"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") ios.setPaletteOpen(false);
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((index) => Math.min(commands.length - 1, index + 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((index) => Math.max(0, index - 1));
              }
              if (event.key === "Enter" && commands[active]) {
                commands[active].run();
                ios.setPaletteOpen(false);
              }
            }}
          >
            <input
              autoFocus
              className="input"
              style={{ width: "100%", border: 0 }}
              placeholder="Search jobs or jump…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Command palette"
            />
            <div className="palette-list">
              {commands.length === 0 ? <p className="muted">Nothing matches.</p> : null}
              {commands.map((command, index) => (
                <button
                  key={command.id}
                  className="palette-item"
                  data-active={index === active}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => {
                    command.run();
                    ios.setPaletteOpen(false);
                  }}
                >
                  <span>{command.label}</span>
                  <span className="tiny">{command.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {help ? (
        <div className="backdrop" onClick={() => setHelp(false)}>
          <div className="modal" role="dialog" aria-label="Keyboard shortcuts" onClick={(event) => event.stopPropagation()}>
            <h2>Shortcuts</h2>
            <p>J / K move through roles. S saves. A adds to the queue. Enter opens a role. O opens the workspace. R tailors the resume. Esc closes the panel. ⌘K opens this search.</p>
            <button className="btn" onClick={() => setHelp(false)}>Close</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ThemeButton() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);
  return (
    <button
      className="icon-btn"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        localStorage.setItem("ios-theme", next);
        setTheme(next);
      }}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}
