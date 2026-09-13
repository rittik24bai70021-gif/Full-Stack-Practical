import { memo } from "react";

function RenderMonitor({
  appRenders,
  statisticsRenders,
  legendRenders,
  instructionsRenders,
}) {
  return (
    <section className="render-monitor-section">
      <div className="render-monitor-heading">
        <div>
          <h2>Live Rendering Performance Monitor</h2>

          <p>
            Open the scheduling form and type in the fields to
            observe which components render again.
          </p>
        </div>

        <span className="monitor-status">
          ● Monitoring
        </span>
      </div>

      <div className="render-monitor-grid">
        <article>
          <span className="render-component-name">
            App Component
          </span>

          <strong>{appRenders}</strong>

          <p>
            Re-renders when form or calendar state changes.
          </p>
        </article>

        <article>
          <span className="render-component-name">
            Statistics
          </span>

          <strong>{statisticsRenders}</strong>

          <p>
            Re-renders only when post counts change.
          </p>
        </article>

        <article>
          <span className="render-component-name">
            Status Legend
          </span>

          <strong>{legendRenders}</strong>

          <p>
            Protected from unnecessary rendering by React.memo.
          </p>
        </article>

        <article>
          <span className="render-component-name">
            Instructions
          </span>

          <strong>{instructionsRenders}</strong>

          <p>
            Remains stable during calendar and form updates.
          </p>
        </article>
      </div>

      <div className="monitor-explanation">
        <strong>How to demonstrate:</strong>

        <span>
          Click Schedule Post and type in the title field. The App
          render count increases, but memoized component counts
          remain unchanged.
        </span>
      </div>
    </section>
  );
}

export default memo(RenderMonitor);