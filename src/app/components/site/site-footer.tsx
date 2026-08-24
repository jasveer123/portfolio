import { profile } from "@/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="font-mono text-xs">
          Built with Next.js · Crafted in Gurugram
        </p>
      </div>
    </footer>
  );
}
