import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JsonLd } from "@/components/json-ld";
import { siteGraph } from "@/lib/schema";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={siteGraph()} />
      <SiteHeader />
      <main className="col flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
