import { CopyButton } from "@/components/data/copy-button";

/** A monospace block with a copy button, for regexes, robots.txt rules and snippets. */
export function CopyBlock({ text, label }: { text: string; label?: string }) {
  return (
    <div className="copy-block">
      <pre>
        <code>{text}</code>
      </pre>
      <div className="mt-3">
        <CopyButton text={text} label={label} />
      </div>
    </div>
  );
}
