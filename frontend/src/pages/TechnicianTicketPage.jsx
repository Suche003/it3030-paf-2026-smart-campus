import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getMyTechTickets,
  updateTechStatus,
  addResolution,
} from "../services/technicianTicketService";
import { getCommentsByTicket } from "../services/commentService";
import "../styles/TechnicianTicketPage.css";

export default function TechnicianTicketPage() {
  const [tickets, setTickets] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [activeResolveId, setActiveResolveId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const techId = user.id || 13;

  const loadTickets = async () => {
    try {
      setLoading(true);

      const res = await getMyTechTickets(techId);
      const ticketList = Array.isArray(res.data) ? res.data : [];
      setTickets(ticketList);

      const commentsData = {};

      await Promise.all(
        ticketList.map(async (t) => {
          try {
            const cRes = await getCommentsByTicket(t.id);
            commentsData[t.id] = Array.isArray(cRes.data) ? cRes.data : [];
          } catch {
            commentsData[t.id] = [];
          }
        })
      );

      setCommentsMap(commentsData);
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateTechStatus(id, status);
      toast.success(`Status updated to ${status}`);
      loadTickets();
    } catch {
      toast.error("Update failed");
    }
  };

  const submitResolution = async (e, id) => {
    e.preventDefault();

    if (!resolutionNote.trim()) {
      toast.error("Resolution note required");
      return;
    }

    try {
      await addResolution(id, resolutionNote);
      await updateTechStatus(id, "RESOLVED");

      toast.success("Ticket Resolved");
      setActiveResolveId(null);
      setResolutionNote("");
      loadTickets();
    } catch {
      toast.error("Action failed");
    }
  };

  const filteredTickets = tickets.filter(
    (t) => filterStatus === "" || t.status === filterStatus
  );

  const getImageUrl = (img) => {
    if (!img) return "";

    if (img.startsWith("http")) return img;

    return img.startsWith("/")
      ? `http://localhost:8081${img}`
      : `http://localhost:8081/${img}`;
  };

  const getStatusClass = (status) => {
    const s = status?.toUpperCase();

    if (s === "OPEN") return "badge-open";
    if (s === "IN_PROGRESS") return "badge-progress";
    if (s === "RESOLVED") return "badge-resolved";
    return "badge-closed";
  };

  return (
    <div className="tech-ticket-page">
      <header className="tech-ticket-header">
        <div>
          <h1>Technician Dashboard</h1>
          <p>Assigned Tickets & Task Management</p>
        </div>

        <div className="tech-ticket-count">
          <span>My Tickets</span>
          <b>{tickets.length}</b>
        </div>
      </header>

      <div className="tech-ticket-toolbar">
        <div className="tech-filter-group">
          <button
            type="button"
            className={filterStatus === "" ? "active" : ""}
            onClick={() => setFilterStatus("")}
          >
            All Tickets
          </button>

          {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
            <button
              type="button"
              key={status}
              className={filterStatus === status ? "active" : ""}
              onClick={() => setFilterStatus(status)}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="tech-reset-btn"
          onClick={() => {
            setFilterStatus("");
            loadTickets();
          }}
        >
          Reset Filters
        </button>
      </div>

      {loading ? (
        <div className="tech-empty">Loading assigned tasks...</div>
      ) : (
        <div className="tech-ticket-grid">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((t) => {
              const ticketImages = [
                t.image1Url || t.image1url,
                t.image2Url || t.image2url,
                t.image3Url || t.image3url,
              ].filter(Boolean);

              return (
                <div key={t.id} className="tech-ticket-card">
                  <div className="tech-ticket-card-top">
                    <span className="ticket-id-tag">TICKET #{t.id}</span>
                    <span className={`status-pill ${getStatusClass(t.status)}`}>
                      {t.status}
                    </span>
                  </div>

                  <h2>{t.title}</h2>

                  <div className="tech-meta-grid">
                    <div className="tech-meta-item full">
                      <label>Resource / Asset</label>
                      <span>
                        🛠️ {t.resourceName || t.resource || "Not Assigned"}
                      </span>
                    </div>

                    <div className="tech-meta-item">
                      <label>Priority</label>
                      <span className={`priority ${t.priority?.toLowerCase()}`}>
                        {t.priority}
                      </span>
                    </div>

                    <div className="tech-meta-item">
                      <label>Location</label>
                      <span>📍 {t.location || "N/A"}</span>
                    </div>
                  </div>

                  {ticketImages.length > 0 && (
                    <div className="tech-ticket-images">
                      {ticketImages.map((img, index) => (
                        <img
                          key={index}
                          src={getImageUrl(img)}
                          alt={`ticket-${index}`}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="comments-box-system">
                    <label>Comments</label>

                    {(commentsMap[t.id] || []).length > 0 ? (
                      commentsMap[t.id].map((c) => (
                        <div key={c.id} className="comment-bubble">
                          💬 {c.comment || c.text}
                        </div>
                      ))
                    ) : (
                      <p>No technical notes recorded.</p>
                    )}
                  </div>

                  <div className="tech-actions">
                    {t.status === "OPEN" && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(t.id, "IN_PROGRESS")}
                      >
                        Start Working
                      </button>
                    )}

                    {t.status === "IN_PROGRESS" && activeResolveId !== t.id && (
                      <button
                        type="button"
                        onClick={() => setActiveResolveId(t.id)}
                      >
                        Submit Resolution
                      </button>
                    )}

                    {t.status === "RESOLVED" && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(t.id, "CLOSED")}
                      >
                        Close Ticket
                      </button>
                    )}
                  </div>

                  {activeResolveId === t.id && (
                    <form
                      onSubmit={(e) => submitResolution(e, t.id)}
                      className="inline-action-form"
                    >
                      <textarea
                        placeholder="Enter final resolution note..."
                        required
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                      />

                      <div className="form-buttons">
                        <button type="submit" className="btn-confirm">
                          Confirm
                        </button>

                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => {
                            setActiveResolveId(null);
                            setResolutionNote("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })
          ) : (
            <div className="tech-empty">No tickets found for this status.</div>
          )}
        </div>
      )}
    </div>
  );
}