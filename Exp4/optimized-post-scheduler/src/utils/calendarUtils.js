export const statusColors = {
  Scheduled: {
    background: "#2563eb",
    border: "#1d4ed8",
    text: "#ffffff",
  },

  Draft: {
    background: "#f59e0b",
    border: "#d97706",
    text: "#ffffff",
  },

  Published: {
    background: "#16a34a",
    border: "#15803d",
    text: "#ffffff",
  },
};

export function calculateStatistics(events) {
  return {
    total: events.length,

    scheduled: events.filter(
      (event) =>
        event.extendedProps?.status === "Scheduled"
    ).length,

    draft: events.filter(
      (event) =>
        event.extendedProps?.status === "Draft"
    ).length,

    published: events.filter(
      (event) =>
        event.extendedProps?.status === "Published"
    ).length,
  };
}

export function getStatusClass(status) {
  const safeStatus = status || "Scheduled";

  return `status-${safeStatus.toLowerCase()}`;
}

export function createCalendarEvent(
  formData,
  selectedEventId
) {
  if (!formData.title.trim()) {
    throw new Error("Please enter a post title.");
  }

  if (!formData.date || !formData.time) {
    throw new Error(
      "Please select a valid date and time."
    );
  }

  const startDate = new Date(
    `${formData.date}T${formData.time}:00`
  );

  if (Number.isNaN(startDate.getTime())) {
    throw new Error(
      "The selected date or time is invalid."
    );
  }

  const endDate = new Date(
    startDate.getTime() + 60 * 60 * 1000
  );

  const color =
    statusColors[formData.status] ||
    statusColors.Scheduled;

  return {
    id: selectedEventId || Date.now().toString(),
    title: formData.title.trim(),
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    backgroundColor: color.background,
    borderColor: color.border,
    textColor: color.text,

    extendedProps: {
      platform: formData.platform,
      status: formData.status,
      description: formData.description.trim(),
    },
  };
}