import { useEffect, useMemo, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import "./App.css";

const STORAGE_KEY = "calendarPosts";

const statusColors = {
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

const emptyForm = {
  title: "",
  date: "",
  time: "10:00",
  platform: "Instagram",
  status: "Scheduled",
  description: "",
};

const samplePosts = [
  {
    id: "1",
    title: "Launch of New Product",
    start: "2026-08-08T11:00:00",
    end: "2026-08-08T12:00:00",
    extendedProps: {
      platform: "Instagram",
      status: "Scheduled",
      description:
        "Publish an Instagram post announcing the launch of our new product.",
    },
  },
  {
    id: "2",
    title: "React Project Update",
    start: "2026-08-10T14:00:00",
    end: "2026-08-10T15:00:00",
    extendedProps: {
      platform: "LinkedIn",
      status: "Draft",
      description:
        "Prepare a LinkedIn update about the interactive calendar project.",
    },
  },
  {
    id: "3",
    title: "Project Successfully Completed",
    start: "2026-08-05T18:00:00",
    end: "2026-08-05T19:00:00",
    extendedProps: {
      platform: "LinkedIn",
      status: "Published",
      description:
        "Published the successful completion announcement for the project.",
    },
  },
];

function formatDateForInput(date) {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTimeForInput(date) {
  if (!date) {
    return "10:00";
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function applyStatusColor(event) {
  const status = event.extendedProps?.status || "Scheduled";
  const color = statusColors[status] || statusColors.Scheduled;

  return {
    ...event,
    backgroundColor: color.background,
    borderColor: color.border,
    textColor: color.text,
    extendedProps: {
      ...event.extendedProps,
      status,
    },
  };
}

function loadSavedPosts() {
  try {
    const storedPosts = localStorage.getItem(STORAGE_KEY);

    if (storedPosts) {
      const parsedPosts = JSON.parse(storedPosts);

      if (Array.isArray(parsedPosts)) {
        return parsedPosts.map(applyStatusColor);
      }
    }
  } catch (error) {
    console.error("Unable to load saved posts:", error);
  }

  return samplePosts.map(applyStatusColor);
}

function App() {
  const [events, setEvents] = useState(loadSavedPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error("Unable to save posts:", error);
    }
  }, [events]);

  const statistics = useMemo(() => {
    return {
      total: events.length,
      scheduled: events.filter(
        (event) => event.extendedProps?.status === "Scheduled"
      ).length,
      draft: events.filter(
        (event) => event.extendedProps?.status === "Draft"
      ).length,
      published: events.filter(
        (event) => event.extendedProps?.status === "Published"
      ).length,
    };
  }, [events]);

  function openAddModal(date = new Date()) {
    setSelectedEventId(null);

    setFormData({
      ...emptyForm,
      date: formatDateForInput(date),
      time: formatTimeForInput(date),
    });

    setErrorMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedEventId(null);
    setFormData(emptyForm);
    setErrorMessage("");
  }

  function handleDateClick(info) {
    openAddModal(info.date);
  }

  function handleEventClick(info) {
    const selectedEvent = info.event;

    setSelectedEventId(selectedEvent.id);

    setFormData({
      title: selectedEvent.title,
      date: formatDateForInput(selectedEvent.start),
      time: formatTimeForInput(selectedEvent.start),
      platform: selectedEvent.extendedProps.platform || "Other",
      status: selectedEvent.extendedProps.status || "Scheduled",
      description: selectedEvent.extendedProps.description || "",
    });

    setErrorMessage("");
    setIsModalOpen(true);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!formData.title.trim()) {
      setErrorMessage("Please enter a post title.");
      return;
    }

    if (!formData.date) {
      setErrorMessage("Please select a valid date.");
      return;
    }

    if (!formData.time) {
      setErrorMessage("Please select a valid time.");
      return;
    }

    const startDate = new Date(
      `${formData.date}T${formData.time}:00`
    );

    if (Number.isNaN(startDate.getTime())) {
      setErrorMessage("The selected date or time is invalid.");
      return;
    }

    const endDate = new Date(
      startDate.getTime() + 60 * 60 * 1000
    );

    const selectedStatusColor =
      statusColors[formData.status] || statusColors.Scheduled;

    const calendarEvent = {
      id: selectedEventId || Date.now().toString(),
      title: formData.title.trim(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      backgroundColor: selectedStatusColor.background,
      borderColor: selectedStatusColor.border,
      textColor: selectedStatusColor.text,
      extendedProps: {
        platform: formData.platform,
        status: formData.status,
        description: formData.description.trim(),
      },
    };

    if (selectedEventId) {
      setEvents((currentEvents) =>
        currentEvents.map((currentEvent) =>
          currentEvent.id === selectedEventId
            ? calendarEvent
            : currentEvent
        )
      );
    } else {
      setEvents((currentEvents) => [
        ...currentEvents,
        calendarEvent,
      ]);
    }

    closeModal();
  }

  function handleEventChange(info) {
    const changedEvent = info.event;

    setEvents((currentEvents) =>
      currentEvents.map((currentEvent) => {
        if (currentEvent.id !== changedEvent.id) {
          return currentEvent;
        }

        return {
          ...currentEvent,
          start: changedEvent.start
            ? changedEvent.start.toISOString()
            : currentEvent.start,
          end: changedEvent.end
            ? changedEvent.end.toISOString()
            : currentEvent.end,
        };
      })
    );
  }

  function deletePost() {
    if (!selectedEventId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) {
      return;
    }

    setEvents((currentEvents) =>
      currentEvents.filter(
        (currentEvent) =>
          currentEvent.id !== selectedEventId
      )
    );

    closeModal();
  }

  function clearAllPosts() {
    if (events.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove all calendar posts?"
    );

    if (confirmed) {
      setEvents([]);
    }
  }

  function restoreSamplePosts() {
    const confirmed = window.confirm(
      "Restore the sample calendar posts?"
    );

    if (confirmed) {
      setEvents(samplePosts.map(applyStatusColor));
    }
  }

  function renderEventContent(eventInfo) {
    const platform =
      eventInfo.event.extendedProps.platform || "Other";

    const status =
      eventInfo.event.extendedProps.status || "Scheduled";

    return (
      <div className="calendar-event">
        <div className="event-top-row">
          <strong className="event-time">
            {eventInfo.timeText}
          </strong>

          <span className="event-status">
            {status}
          </span>
        </div>

        <span className="event-title">
          {eventInfo.event.title}
        </span>

        <small className="event-platform">
          {platform}
        </small>
      </div>
    );
  }

  return (
    <div className="app">
     <header className="top-header">
  <div className="header-left">
    <h1>Social Media Post Scheduler</h1>

    <p className="header-description">
      Organize, manage, and reschedule social media posts
      using an interactive calendar.
    </p>

    <div className="student-inline-info">
      <span className="student-avatar-small">RB</span>

      <div>
        <p>Designed and Developed By</p>

        <strong>Rittik Basak</strong>

        <span>UID: 24BAI70021</span>
      </div>
    </div>
  </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => openAddModal(new Date())}
        >
          + Schedule Post
        </button>
      </header>

      <main className="main-content">
        <section className="statistics-grid">
          <article className="stat-card">
            <div className="stat-icon total-icon">P</div>

            <div>
              <span>Total Posts</span>
              <strong>{statistics.total}</strong>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon scheduled-icon">S</div>

            <div>
              <span>Scheduled</span>
              <strong>{statistics.scheduled}</strong>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon draft-icon">D</div>

            <div>
              <span>Drafts</span>
              <strong>{statistics.draft}</strong>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon published-icon">✓</div>

            <div>
              <span>Published</span>
              <strong>{statistics.published}</strong>
            </div>
          </article>
        </section>

        <section className="calendar-section">
          <div className="calendar-heading">
            <div>
              <h2>Content Calendar</h2>

              <p>
                Click a date to add a post. Drag an existing post
                to reschedule it.
              </p>

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
            </div>

            <div className="calendar-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={restoreSamplePosts}
              >
                Restore Samples
              </button>

              <button
                className="secondary-button danger-button"
                type="button"
                onClick={clearAllPosts}
                disabled={events.length === 0}
              >
                Clear Calendar
              </button>
            </div>
          </div>

          <div className="calendar-wrapper">
            <FullCalendar
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right:
                  "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              buttonText={{
                today: "Today",
                month: "Month",
                week: "Week",
                day: "Day",
              }}
              events={events}
              editable
              selectable
              dayMaxEvents
              nowIndicator
              height="auto"
              eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
              }}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventDrop={handleEventChange}
              eventResize={handleEventChange}
              eventClassNames={(info) => {
                 const status =
                    info.event.extendedProps.status || "Scheduled";

                  return [`status-${status.toLowerCase()}`];
                }}
              eventContent={renderEventContent}
            />
          </div>
        </section>

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
      </main>

      {isModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={closeModal}
        >
          <div
            className="modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="modal-label">
                  {selectedEventId
                    ? "Update Schedule"
                    : "New Schedule"}
                </p>

                <h2>
                  {selectedEventId
                    ? "Edit Post"
                    : "Schedule a Post"}
                </h2>
              </div>

              <button
                className="close-button"
                type="button"
                onClick={closeModal}
                aria-label="Close scheduling form"
              >
                ×
              </button>
            </div>

            <form
              className="post-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label htmlFor="title">Post title</label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Enter post title"
                  value={formData.title}
                  onChange={handleInputChange}
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>

                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="time">Time</label>

                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="platform">
                    Platform
                  </label>

                  <select
                    id="platform"
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                  >
                    <option>Instagram</option>
                    <option>Facebook</option>
                    <option>LinkedIn</option>
                    <option>YouTube</option>
                    <option>Twitter</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option>Draft</option>
                    <option>Scheduled</option>
                    <option>Published</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  placeholder="Write a short post description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              {errorMessage && (
                <p className="error-message">
                  {errorMessage}
                </p>
              )}

              <div className="form-actions">
                {selectedEventId && (
                  <button
                    type="button"
                    className="delete-button"
                    onClick={deletePost}
                  >
                    Delete Post
                  </button>
                )}

                <div className="right-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    {selectedEventId
                      ? "Save Changes"
                      : "Schedule Post"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer>
        Social Media Post Scheduler developed using React and
        FullCalendar
      </footer>
    </div>
  );
}

export default App;