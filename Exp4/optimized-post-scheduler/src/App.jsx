import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import Statistics from "./components/Statistics";
import Instructions from "./components/Instructions";
import StatusLegend from "./components/StatusLegend";
import RenderMonitor from "./components/RenderMonitor";

import {
  calculateStatistics,
  createCalendarEvent,
  getStatusClass,
  statusColors,
} from "./utils/calendarUtils";

import "./App.css";

const STORAGE_KEY = "optimizedCalendarPosts";

const emptyForm = {
  title: "",
  date: "",
  time: "10:00",
  platform: "Instagram",
  status: "Scheduled",
  description: "",
};
const platformDetails = {
  Instagram: {
    icon: "IG",
    className: "platform-instagram",
  },

  Facebook: {
    icon: "FB",
    className: "platform-facebook",
  },

  LinkedIn: {
    icon: "IN",
    className: "platform-linkedin",
  },

  YouTube: {
    icon: "YT",
    className: "platform-youtube",
  },

  Twitter: {
    icon: "X",
    className: "platform-twitter",
  },

  Other: {
    icon: "OT",
    className: "platform-other",
  },
};

const samplePosts = [
  {
    id: "sample-1",
    title: "Launch of New Product",
    start: "2026-08-08T11:00:00",
    end: "2026-08-08T12:00:00",
    backgroundColor: statusColors.Scheduled.background,
    borderColor: statusColors.Scheduled.border,
    textColor: statusColors.Scheduled.text,
    extendedProps: {
      platform: "Instagram",
      status: "Scheduled",
      description:
        "Publish an Instagram post announcing the launch of the new product.",
    },
  },
  {
    id: "sample-2",
    title: "React Project Update",
    start: "2026-08-10T14:00:00",
    end: "2026-08-10T15:00:00",
    backgroundColor: statusColors.Draft.background,
    borderColor: statusColors.Draft.border,
    textColor: statusColors.Draft.text,
    extendedProps: {
      platform: "LinkedIn",
      status: "Draft",
      description:
        "Prepare a LinkedIn update about the optimized React calendar.",
    },
  },
  {
    id: "sample-3",
    title: "Project Successfully Completed",
    start: "2026-08-05T18:00:00",
    end: "2026-08-05T19:00:00",
    backgroundColor: statusColors.Published.background,
    borderColor: statusColors.Published.border,
    textColor: statusColors.Published.text,
    extendedProps: {
      platform: "LinkedIn",
      status: "Published",
      description:
        "Published an announcement about the successful completion of the project.",
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

function applyStatusColor(calendarEvent) {
  const status =
    calendarEvent.extendedProps?.status || "Scheduled";

  const color =
    statusColors[status] || statusColors.Scheduled;

  return {
    ...calendarEvent,
    backgroundColor: color.background,
    borderColor: color.border,
    textColor: color.text,
    extendedProps: {
      ...calendarEvent.extendedProps,
      status,
    },
  };
}

function loadSavedPosts() {
  try {
    const savedPosts = localStorage.getItem(STORAGE_KEY);

    if (savedPosts) {
      const parsedPosts = JSON.parse(savedPosts);

      if (Array.isArray(parsedPosts)) {
        return parsedPosts.map(applyStatusColor);
      }
    }
  } catch (error) {
    console.error("Unable to load saved posts:", error);
  }

  return samplePosts;
}

function App() {
  const appRenderCount = useRef(0);
  appRenderCount.current += 1;

  const [events, setEvents] = useState(loadSavedPosts);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedEventId, setSelectedEventId] =
    useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const [errorMessage, setErrorMessage] = useState("");

  const [componentRenderCounts, setComponentRenderCounts] =
    useState({
      statistics: 0,
      legend: 0,
      instructions: 0,
    });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events)
      );
    } catch (error) {
      console.error("Unable to save posts:", error);
    }
  }, [events]);

  const statistics = useMemo(() => {
    return calculateStatistics(events);
  }, [events]);

  const openAddModal = useCallback((date = new Date()) => {
    setSelectedEventId(null);

    setFormData({
      ...emptyForm,
      date: formatDateForInput(date),
      time: formatTimeForInput(date),
    });

    setErrorMessage("");
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEventId(null);
    setFormData(emptyForm);
    setErrorMessage("");
  }, []);

  const handleDateClick = useCallback(
    (info) => {
      openAddModal(info.date);
    },
    [openAddModal]
  );

  const handleEventClick = useCallback((info) => {
    const selectedEvent = info.event;

    setSelectedEventId(selectedEvent.id);

    setFormData({
      title: selectedEvent.title,
      date: formatDateForInput(selectedEvent.start),
      time: formatTimeForInput(selectedEvent.start),
      platform:
        selectedEvent.extendedProps.platform || "Other",
      status:
        selectedEvent.extendedProps.status || "Scheduled",
      description:
        selectedEvent.extendedProps.description || "",
    });

    setErrorMessage("");
    setIsModalOpen(true);
  }, []);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrorMessage("");
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      let calendarEvent;

      try {
        calendarEvent = createCalendarEvent(
          formData,
          selectedEventId
        );
      } catch (error) {
        setErrorMessage(error.message);
        return;
      }

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
    },
    [formData, selectedEventId, closeModal]
  );

  const handleEventChange = useCallback((info) => {
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
  }, []);

  const deletePost = useCallback(() => {
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
  }, [selectedEventId, closeModal]);

  const clearAllPosts = useCallback(() => {
    if (events.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove all posts?"
    );

    if (confirmed) {
      setEvents([]);
    }
  }, [events.length]);

  const restoreSamplePosts = useCallback(() => {
    const confirmed = window.confirm(
      "Restore the sample calendar posts?"
    );

    if (confirmed) {
      setEvents(samplePosts.map(applyStatusColor));
    }
  }, []);

  const getEventClassNames = useCallback((info) => {
    const status =
      info.event.extendedProps.status || "Scheduled";

    return [getStatusClass(status)];
  }, []);

  const renderEventContent = useCallback((eventInfo) => {
  const platform =
    eventInfo.event.extendedProps.platform || "Other";

  const status =
    eventInfo.event.extendedProps.status || "Scheduled";

  const platformInfo =
    platformDetails[platform] || platformDetails.Other;

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

      <div className="event-platform-row">
        <span
          className={`platform-badge ${platformInfo.className}`}
        >
          <strong>{platformInfo.icon}</strong>
          {platform}
        </span>
      </div>
    </div>
  );
}, []);

  const trackStatisticsRender = useCallback((count) => {
    setComponentRenderCounts((currentCounts) => {
      if (currentCounts.statistics === count) {
        return currentCounts;
      }

      return {
        ...currentCounts,
        statistics: count,
      };
    });
  }, []);

  const trackLegendRender = useCallback((count) => {
    setComponentRenderCounts((currentCounts) => {
      if (currentCounts.legend === count) {
        return currentCounts;
      }

      return {
        ...currentCounts,
        legend: count,
      };
    });
  }, []);

  const trackInstructionsRender = useCallback((count) => {
    setComponentRenderCounts((currentCounts) => {
      if (currentCounts.instructions === count) {
        return currentCounts;
      }

      return {
        ...currentCounts,
        instructions: count,
      };
    });
  }, []);
const avoidedRenders = Math.max(
  0,
  appRenderCount.current -
    componentRenderCounts.statistics -
    componentRenderCounts.legend -
    componentRenderCounts.instructions
);

const optimizationPercentage =
  appRenderCount.current > 0
    ? Math.round(
        (avoidedRenders /
          (appRenderCount.current * 3)) *
          100
      )
    : 0;

const performanceStatus =
  optimizationPercentage >= 60
    ? "Excellent"
    : optimizationPercentage >= 35
      ? "Good"
      : "Needs Improvement";
  return (
    <div className="app">
      <header className="top-header">
  <div className="header-left">
    <div className="student-header-info">
      <span className="student-avatar">RB</span>

      <div>
        <p className="student-label">
          Designed and Developed By
        </p>

        <h3>Rittik Basak</h3>

        <span className="student-uid">
          UID: 24BAI70021
        </span>
      </div>
    </div>

    <h1>
      Optimized Social Media Post Scheduler
    </h1>

    <p className="header-description">
      A performance-optimized calendar for scheduling,
      identifying, and managing posts across different
      social media platforms.
    </p>
  </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => openAddModal(new Date())}
        >
          + Schedule Post
        </button>
      </header>

      <main className="main-content">
        <Statistics
          total={statistics.total}
          scheduled={statistics.scheduled}
          draft={statistics.draft}
          published={statistics.published}
          onRender={trackStatisticsRender}
        />

        <section className="calendar-section">
          <div className="calendar-heading">
            <div>
              <h2>Optimized Content Calendar</h2>

              <p>
                Click a date to create a post. Drag an existing
                post to reschedule it.
              </p>

              <StatusLegend
                onRender={trackLegendRender}
              />
            </div>
            <div className="platform-legend">
  <span className="platform-badge platform-instagram">
    <strong>IG</strong>
    Instagram
  </span>

  <span className="platform-badge platform-facebook">
    <strong>FB</strong>
    Facebook
  </span>

  <span className="platform-badge platform-linkedin">
    <strong>IN</strong>
    LinkedIn
  </span>

  <span className="platform-badge platform-youtube">
    <strong>YT</strong>
    YouTube
  </span>

  <span className="platform-badge platform-twitter">
    <strong>X</strong>
    Twitter
  </span>
</div>

            <div className="calendar-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={restoreSamplePosts}
              >
                Restore Samples
              </button>

              <button
                type="button"
                className="secondary-button danger-button"
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
              eventClassNames={getEventClassNames}
              eventContent={renderEventContent}
            />
          </div>
        </section>

        <RenderMonitor
          appRenders={appRenderCount.current}
          statisticsRenders={
            componentRenderCounts.statistics
          }
          legendRenders={
            componentRenderCounts.legend
          }
          instructionsRenders={
            componentRenderCounts.instructions
          }
        />
<section className="performance-summary">
  <div className="performance-summary-header">
    <div>
      <h2>Optimization Summary</h2>

      <p>
        A live overview of rendering efficiency in the
        application.
      </p>
    </div>

    <span
      className={`performance-badge ${performanceStatus
        .toLowerCase()
        .replace(" ", "-")}`}
    >
      {performanceStatus}
    </span>
  </div>

  <div className="performance-summary-grid">
    <article>
      <span>App Renders</span>
      <strong>{appRenderCount.current}</strong>
    </article>

    <article>
      <span>Memoized Renders</span>
      <strong>
        {componentRenderCounts.statistics +
          componentRenderCounts.legend +
          componentRenderCounts.instructions}
      </strong>
    </article>

    <article>
      <span>Avoided Renders</span>
      <strong>{avoidedRenders}</strong>
    </article>

    <article>
      <span>Optimization Score</span>
      <strong>{optimizationPercentage}%</strong>
    </article>
  </div>

  <div className="performance-progress">
    <div
      className="performance-progress-bar"
      style={{
        width: `${optimizationPercentage}%`,
      }}
    />
  </div>
</section>
        <section className="optimization-section">
          <h2>Performance Optimization Applied</h2>

          <div className="optimization-grid">
            <article>
              <span>React.memo</span>

              <p>
                Prevents reusable child components from rendering
                again when their properties remain unchanged.
              </p>
            </article>

            <article>
              <span>useMemo</span>

              <p>
                Caches post statistics and recalculates them only
                when the calendar event list changes.
              </p>
            </article>

            <article>
              <span>useCallback</span>

              <p>
                Maintains stable function references for calendar
                operations and user interactions.
              </p>
            </article>
          </div>
        </section>

        <Instructions
          onRender={trackInstructionsRender}
        />
        <section className="student-info-section">
  <div className="student-info-icon">RB</div>

  <div className="student-info-details">
    <p>Designed and Developed By</p>

    <h2>Rittik Basak</h2>

    <span>
      UID: 24BAI70021
    </span>
  </div>

  <div className="student-work-badge">
    Student Project
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-form-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <p className="modal-label">
                  {selectedEventId
                    ? "Update Schedule"
                    : "New Schedule"}
                </p>

                <h2 id="post-form-title">
                  {selectedEventId
                    ? "Edit Post"
                    : "Schedule a Post"}
                </h2>
              </div>

              <button
                type="button"
                className="close-button"
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
                <label htmlFor="title">
                  Post title
                </label>

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
                  <label htmlFor="date">
                    Date
                  </label>

                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="time">
                    Time
                  </label>

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
                  <label htmlFor="status">
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option>Scheduled</option>
                    <option>Draft</option>
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
                <p
                  className="error-message"
                  role="alert"
                >
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
  <p>
    Optimized React Calendar using React.memo, useMemo,
    useCallback and FullCalendar
  </p>

  <span>
    Developed by Rittik Basak | UID: 24BAI70021
  </span>
</footer>
    </div>
  );
}

export default App;