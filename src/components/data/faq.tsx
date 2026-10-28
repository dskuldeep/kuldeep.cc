/** Visible FAQ. Pair with faqNode() in the page graph so the markup matches the JSON-LD. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="mt-20" aria-labelledby="faq">
      <h2 id="faq" className="section-title mb-6">
        Questions
      </h2>
      <div className="article">
        {items.map((i) => (
          <div key={i.q}>
            <h3>{i.q}</h3>
            <p>{i.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
