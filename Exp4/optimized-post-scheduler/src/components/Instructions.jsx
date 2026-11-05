import { memo, useEffect, useRef } from "react";

function Instructions({ onRender }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    onRender?.(renderCount.current);
  });

  console.log(
    `Instructions component rendered: ${renderCount.current}`
  );

  return (
    <section className="instruction-section">
      <h2>How to Use</h2>

      <div className="instruction-grid">
        <article>
          <span>1</span>

          <div>
            <h3>Create a Post</h3>

            <p>
              Click a calendar date or select Schedule Post.
            </p>
          </div>
        </article>

        <article>
          <span>2</span>

          <div>
            <h3>Edit a Post</h3>

            <p>
              Click an existing event to view or update it.
            </p>
          </div>
        </article>

        <article>
          <span>3</span>

          <div>
            <h3>Reschedule</h3>

            <p>
              Drag and drop a post onto another date or time.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

export default memo(Instructions);