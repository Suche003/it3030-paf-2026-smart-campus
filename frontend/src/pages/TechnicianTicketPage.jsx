import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getMyTechTickets,
  updateTechStatus,
  addResolution
} from "../services/technicianTicketService";
import { getCommentsByTicket } from "../services/commentService";

export default function TechnicianTicketPage() {
  const [tickets, setTickets] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [activeResolveId, setActiveResolveId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");

  // Hardcoded for now; ideally fetched from an Auth context
  const techId = 1;

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
    } catch (err) {
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
    if (!resolutionNote.trim()) return toast.error("Resolution note required");
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

  const filteredTickets = tickets.filter(t => 
    filterStatus === "" || t.status === filterStatus
  );

  const getStatusClass = (status) => {
    const s = status?.toUpperCase();
    if (s === "OPEN") return "badge-open";
    if (s === "IN_PROGRESS") return "badge-progress";
    if (s === "RESOLVED") return "badge-resolved";
    return "badge-closed";
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Technician Dashboard</h1>
          <p className="page-subtitle">Assigned Tickets & Task Management</p>
        </div>
        <div className="stats-mini">
          <span className="total-label">My Tickets</span>
          <span className="total-badge">{tickets.length}</span>
        </div>
      </header>

      <div className="toolbar">
        <div className="filter-group">
          <button 
            className={`filter-btn ${filterStatus === "" ? "active" : ""}`} 
            onClick={() => setFilterStatus("")}
          >
            All Tickets
          </button>
          {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(status => (
            <button 
              key={status}
              className={`filter-btn ${filterStatus === status ? "active" : ""}`} 
              onClick={() => setFilterStatus(status)}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
        
        <button className="btn-reset" onClick={() => { setFilterStatus(""); loadTickets(); }}>
          Reset Filters
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading assigned tasks...</div>
      ) : (
        <div className="admin-grid">
          {filteredTickets.length > 0 ? filteredTickets.map((t) => (
            <div key={t.id} className="card admin-ticket-card">
              <div className="admin-card-body">
                <div className="header-row">
                  <span className="ticket-id-tag">TICKET #{t.id}</span>
                  <span className={`status-dropdown-pill ${getStatusClass(t.status)}`}>
                    {t.status}
                  </span>
                </div>

                <h3>{t.title}</h3>
                <p className="description-text">{t.description}</p>

                <div className="admin-meta-grid">
                  <div className="meta-item">
                    <label>Resource / Asset</label>
                    <span className="meta-value resource-highlight">🛠️ {t.resourceName || t.resource || "Not Assigned"}</span>
                  </div>
                  <div className="meta-item">
                    <label>Priority</label>
                    <span className={`tag-priority ${t.priority?.toLowerCase()}`}>{t.priority}</span>
                  </div>
                  <div className="meta-item">
                    <label>Location</label>
                    <span className="meta-value">📍 {t.location || "N/A"}</span>
                  </div>
                </div>

                <div className="comments-box-system">
                  <label className="section-label">Comments</label>
                  <div className="comments-scroll">
                    {(commentsMap[t.id] || []).length > 0 ? (
                      commentsMap[t.id].map((c) => (
                        <div key={c.id} className="comment-bubble">
                          <span className="msg">💬 {c.comment || c.text}</span>
                        </div>
                      ))
                    ) : (
                      <p className="no-data-text">No technical notes recorded.</p>
                    )}
                  </div>
                </div>

                <div className="admin-actions">
                  {t.status === "OPEN" && (
                    <button className="btn-assign" onClick={() => handleStatusUpdate(t.id, "IN_PROGRESS")}>
                      Start Working
                    </button>
                  )}
                  
                  {t.status === "IN_PROGRESS" && activeResolveId !== t.id && (
                    <button className="btn-assign" onClick={() => setActiveResolveId(t.id)}>
                      Submit Resolution
                    </button>
                  )}

                  {t.status === "RESOLVED" && (
                    <button className="btn-assign" onClick={() => handleStatusUpdate(t.id, "CLOSED")}>
                      Close Ticket
                    </button>
                  )}
                </div>

                {activeResolveId === t.id && (
                  <form onSubmit={(e) => submitResolution(e, t.id)} className="inline-action-form">
                    <textarea 
                      placeholder="Enter Final Resolution Note..."
                      required 
                      value={resolutionNote}
                      onChange={e => setResolutionNote(e.target.value)}
                    />
                    <div className="form-buttons">
                      <button type="submit" className="btn-confirm">Confirm</button>
                      <button type="button" onClick={() => { setActiveResolveId(null); setResolutionNote(""); }} className="btn-cancel">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )) : (
            <div className="no-tickets-msg">No tickets found for this status.</div>
          )}
        </div>
      )}

      <style>{`
        .page-container { padding: 20px; color: #fff; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .page-title { font-size: 24px; margin-bottom: 10px; }
        .page-subtitle { color: #94a3b8; font-size: 14px; margin: 5px 0 0 0; }

        .stats-mini { display: flex; align-items: center; gap: 10px; background: #3f3f40; padding: 8px 16px; border-radius: 50px; border: 1px solid #4f4f50; }
        .total-badge { background: #8B3DFF; color: white; padding: 2px 10px; border-radius: 20px; font-weight: bold; }

        .toolbar { display: flex; justify-content: space-between; background: #252526; padding: 15px 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #333; align-items: center; }
        .filter-group { display: flex; gap: 42px; flex-wrap: wrap; }
        .filter-btn { background: transparent; color: #94a3b8; border: 1px solid #444; padding: 8px 18px; border-radius: 10px; cursor: pointer; transition: 0.2s; font-weight: 600; }
        .filter-btn.active { background: #ff6b97; color: white; border-color: #ff6b97; box-shadow: 0 4px 12px rgba(255, 107, 151, 0.3); }
        .btn-reset { background: transparent; color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 8px 18px; border-radius: 10px; cursor: pointer; }

        .admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
        .admin-ticket-card { background: #303031; border-radius: 12px; border: 1px solid #444; overflow: hidden; }
        .admin-card-body { padding: 20px; }

        .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .ticket-id-tag { color: #fcfafe; font-weight: 700; font-family: monospace; font-size: 14px; }
        .status-dropdown-pill { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }

        .admin-meta-grid { display: grid; grid-template-columns: 1fr 1fr; background: #252526; padding: 15px; border-radius: 10px; margin: 15px 0; gap: 12px; border: 1px solid #333; }
        .meta-item:first-child { grid-column: span 2; border-bottom: 1px solid #333; padding-bottom: 8px; }
        .meta-item label { display: block; font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; }
        .meta-value { font-size: 14px; }

        .comments-box-system { background: #1a1a1b; border-radius: 8px; padding: 12px; margin-bottom: 15px; border: 1px solid #333; }
        .section-label { font-size: 10px; color: #64748b; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 8px; }
        .comments-scroll { max-height: 100px; overflow-y: auto; }
        .comment-bubble { background: #3b3b3c; padding: 8px; border-radius: 6px; margin-bottom: 6px; border-left: 3px solid #8B3DFF; font-size: 13px; }

        .btn-assign { width: 100%; background: #8B3DFF; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .inline-action-form { background: #252526; padding: 15px; border-radius: 8px; display: flex; flex-direction: column; gap: 10px; border: 1px solid #444; }
        .inline-action-form textarea { background: #1a1a1b; color: white; border: 1px solid #444; padding: 10px; border-radius: 6px; resize: none; min-height: 80px; }
        .form-buttons { display: flex; gap: 10px; }
        .btn-confirm { flex: 2; background: #10b981; color: white; border: none; padding: 8px; border-radius: 6px; font-weight: 600; cursor: pointer; }
        .btn-cancel { flex: 1; background: #4b5563; color: white; border: none; border-radius: 6px; cursor: pointer; }

        .badge-open { background: #1e3a8a; color: #60a5fa; }
        .badge-progress { background: #451a03; color: #fbbf24; }
        .badge-resolved { background: #064e3b; color: #6ee7b7; }
        .badge-closed { background: #3f3f46; color: #d1d5db; }

        .tag-priority.high { color: #ef4444; font-weight: 700; }
        .tag-priority.medium { color: #f59e0b; font-weight: 700; }
        .tag-priority.low { color: #10b981; font-weight: 700; }
        
        .loading-state, .no-tickets-msg { text-align: center; padding: 40px; color: #94a3b8; }
      `}</style>
    </div>
  );
}