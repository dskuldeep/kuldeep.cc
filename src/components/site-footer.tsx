import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="col pb-10 pt-24">
      <hr className="rule mb-6" />
      <div className="meta flex flex-wrap items-baseline gap-x-5 gap-y-2">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <a className="link" href="/feed.xml">
          RSS
        </a>
        <a className="link" href={SITE.social.x} target="_blank" rel="noreferrer">
          X
        </a>
        <a className="link" href={SITE.social.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a className="link" href={SITE.social.email}>
          Email
        </a>
      </div>
    </footer>
  );
}
