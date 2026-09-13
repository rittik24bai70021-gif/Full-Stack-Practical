import { memo, useEffect, useRef } from "react";

function StatusLegend({ onRender }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    onRender?.(renderCount.current);
  });

  console.log(
    `StatusLegend component rendered: ${renderCount.current}`
  );

  return (
    <div className="status-legend">
      <span>
        <i className="legend-dot scheduled-dot" />
        Scheduled
      </span>

      <span>
        <i className="legend-dot draft-dot" />
        Draft
      </span>

      <span>
        <i className="legend-dot published-dot" />
        Published
      </span>
    </div>
  );
}

export default memo(StatusLegend);