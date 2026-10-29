import Link from "next/link";
import { DatasetViewer } from "@/components/data/dataset-viewer";
import { fmtMonth, fmtNumber } from "@/lib/data";
import { SITE } from "@/lib/site";

interface Props {
  title: string;
  dek: string;
  updated: string;
  records?: number;
  recordLabel?: string;
  download?: string;
}

/** Title block shared by every dataset page: H1, standfirst, byline, freshness, data viewer and downloads. */
export function DatasetHeader({ title, dek, updated, records, recordLabel = "records", download }: Props) {
  return (
    <header className="mb-12">
      <h1 className="statement max-w-[22ch]">{title}</h1>
      <p className="lede mt-6 max-w-[40rem]">{dek}</p>
      <p className="meta mt-6 flex flex-wrap gap-x-4 gap-y-1">
        <span>
          Compiled by{" "}
          <Link href="/about" className="link" rel="author">
            {SITE.name}
          </Link>
          , data aggregator
        </span>
        <span>
          Updated <time dateTime={updated}>{fmtMonth(updated)}</time>
        </span>
        {records !== undefined && (
          <span>
            {fmtNumber(records)} {recordLabel}
          </span>
        )}
        <span>
          <Link href="/data/methodology" className="link">
            Methodology
          </Link>
        </span>
      </p>
      {download && (
        <div className="mt-6">
          <DatasetViewer slug={download} title={title} />
        </div>
      )}
    </header>
  );
}
