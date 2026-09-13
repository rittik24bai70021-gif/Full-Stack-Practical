import { memo, useEffect, useRef } from "react";

function Statistics({
  total,
  scheduled,
  draft,
  published,
  onRender,
}) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    onRender?.(renderCount.current);
  });

  console.log(
    `Statistics component rendered: ${renderCount.current}`
  );

  return (
    <section className="statistics-grid">
      <article className="stat-card">
        <div className="stat-icon total-icon">P</div>

        <div>
          <span>Total Posts</span>
          <strong>{total}</strong>
        </div>
      </article>

      <article className="stat-card">
        <div className="stat-icon scheduled-icon">S</div>

        <div>
          <span>Scheduled</span>
          <strong>{scheduled}</strong>
        </div>
      </article>

      <article className="stat-card">
        <div className="stat-icon draft-icon">D</div>

        <div>
          <span>Drafts</span>
          <strong>{draft}</strong>
        </div>
      </article>

      <article className="stat-card">
        <div className="stat-icon published-icon">✓</div>

        <div>
          <span>Published</span>
          <strong>{published}</strong>
        </div>
      </article>
    </section>
  );
}

export default memo(Statistics);