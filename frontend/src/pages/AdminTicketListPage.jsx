import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAllAdminTickets,
  assignTech,
  rejectTicket
} from "../services/ticketService";

export default function AdminTicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [activeAction, setActiveAction] = useState({ id: null, type: null });
  const [formData, setFormData] = useState({
    techId: "",
    techName: "",
    note: ""
  });

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await getAllAdminTickets();
      setTickets(res.data || []);
    } catch (error) {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // ONLY KEEP OPEN + REJECTED VISUALS (NO LOGIC CHANGE IN STYLE)
  const getStatusClass = (status) => {
    const s = status?.toUpperCase();
    if (s === "OPEN") return "badge-open";
    if (s === "REJECTED") return "badge-rejected";
    if (s === "IN_PROGRESS") return "badge-progress";
    if (s === "RESOLVED") return "badge-resolved";
    if (s === "CLOSED") return "badge-closed";
    return "badge-default";
  };

  const getPriorityClass = (priority) => {
    const p = priority?.toLowerCase();
    if (p === "high" || p === "critical") return "priority-high";
    if (p === "medium") return "priority-med";
    return "priority-low";
  };

  const closeForm = () => {
    setActiveAction({ id: null, type: null });
    setFormData({ techId: "", techName: "", note: "" });
  };

  // ONLY REJECT ACTION
  const handleStatusSelect = (id, newStatus) => {
    if (newStatus === "REJECTED") {
      setActiveAction({ id, type: "REJECTED" });
    }
  };

  // ONLY ASSIGN + REJECT LOGIC
  const handleSubmitAction = async (e, ticketId) => {
    e.preventDefault();
    try {
      if (activeAction.type === "ASSIGN") {
        await assignTech(ticketId, formData.techId, formData.techName);
        toast.success("Technician assigned");
      } 
      else if (activeAction.type === "REJECTED") {
        await rejectTicket(ticketId, formData.note);
        toast.success("Ticket Rejected");
      }

      closeForm();
      loadTickets();
    } catch {
      toast.error("Action failed. Please check inputs.");
    }
  };

  const filteredTickets = tickets.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === "" || t.status === filterStatus)
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Admin Control Panel</h1>
          <p className="page-subtitle">Manage system tickets and technician assignments</p>
        </div>

        <div className="stats-mini">
          <span className="total-label">Total Tickets</span>
          <span className="total-badge">{tickets.length}</span>
        </div>
      </header>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="admin-grid">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="card admin-ticket-card">
            <div className="admin-card-body">

              <div className="header-row">
                <span className="ticket-id-tag">TICKET #{ticket.id}</span>

                {/* NO STYLE CHANGE */}
                <select
                  className={`status-dropdown-pill ${getStatusClass(ticket.status)}`}
                  value={ticket.status}
                  onChange={(e) => handleStatusSelect(ticket.id, e.target.value)}
                  style={{ fontSize: "14px" }}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <h3>{ticket.title}</h3>
              <p className="description-text">{ticket.description}</p>

              <div className="admin-meta-grid">
                <div className="meta-item">
                  <label>Priority</label>
                  <span
                    className={`tag ${getPriorityClass(ticket.priority)}`}
                    style={{
                      color: "#991b1b",
                      display: "block",
                      textAlign: "center"
                    }}
                  >
                    {ticket.priority}
                  </span>
                </div>

                <div className="meta-item">
                  <label>Assigned To</label>
                  <span
                    className="tech-name"
                    style={{
                      color: "#991b1b",
                      display: "block",
                      textAlign: "center"
                    }}
                  >
                    {ticket.technicianName || "Unassigned"}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}
              {activeAction.id === ticket.id ? (
                <form
                  onSubmit={(e) => handleSubmitAction(e, ticket.id)}
                  className="inline-action-form"
                >
                  {activeAction.type === "ASSIGN" ? (
                    <>
                      <input
                        type="text"
                        placeholder="Tech ID"
                        required
                        value={formData.techId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            techId: e.target.value
                          })
                        }
                      />

                      <input
                        type="text"
                        placeholder="Tech Name"
                        required
                        value={formData.techName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            techName: e.target.value
                          })
                        }
                      />
                    </>
                  ) : (
                    <textarea
                      placeholder="Reason for rejection..."
                      required
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          note: e.target.value
                        })
                      }
                    />
                  )}

                  <div className="form-buttons">
                    <button type="submit" className="btn-confirm">
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={closeForm}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="admin-actions">
                  <button
                    onClick={() =>
                      setActiveAction({ id: ticket.id, type: "ASSIGN" })
                    }
                    className="btn-assign"
                  >
                    Assign Technician
                  </button>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* 🔥 STYLE LEFT EXACTLY SAME (NO CHANGES) */}
      <style>{`
        .admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; margin-top: 20px; }
        .admin-ticket-card { background: #303031; border-radius: 12px; border: 1px solid #e2e8f0; transition: 0.3s; }
        .admin-card-body { padding: 20px; }

        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }

        .stats-mini { display: flex; align-items: center; gap: 10px; background: #d43666; padding: 8px 16px; border-radius: 50px; border: 1px solid #4f4f50; }
        .total-label { color: #f7f9fb; font-size: 14px; font-weight: 500; }
        .total-badge { background: #f8f6fa; color: black; padding: 2px 10px; border-radius: 20px; font-weight: bold; font-size: 14px; }

        .header-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .status-dropdown-pill { border: none; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; }

        .admin-meta-grid { display: grid; grid-template-columns: 1fr 1fr; background: #a3a5a8; padding: 12px; border-radius: 8px; margin: 15px 0; }

        .meta-item label { display: block; font-size: 12px; color: #0e0e0e; font-weight: 700; margin-bottom: 4px; text-transform: uppercase; display: flex; justify-content: center; align-items: center;}

        .inline-action-form { background: #67686a; padding: 15px; border-radius: 8px; display: flex; flex-direction: column; gap: 10px; animation: fadeIn 0.2s; }

        .inline-action-form input, .inline-action-form textarea { padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; }

        .inline-action-form textarea { min-height: 60px; resize: vertical; }

        .form-buttons { display: flex; gap: 8px; }

        .btn-confirm { flex: 2; background: #8b3dff; color: white; border: none; padding: 8px; border-radius: 6px; font-weight: 600; cursor: pointer; }

        .btn-cancel { flex: 1; background: #8a9fbc; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; }

        .btn-assign { width: 60%; margin: 0 auto; display: block; background: #8b3dff; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

        .badge-open { background: #e0f2fe; color: #0369a1; }
        .badge-progress { background: #fef3c7; color: #b45309; }
        .badge-resolved { background: #dcfce7; color: #15803d; }
        .badge-rejected { background: #fee2e2; color: #b91c1c; }
        .badge-closed { background: #e2e8f0; color: #475569; }
      `}</style>
    </div>
  );
}