import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAllAdminTickets,
  assignTech,
  rejectTicket,
  getTechnicians,
} from "../services/ticketService";

export default function AdminTicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [activeAction, setActiveAction] = useState({ id: null, type: null });
  const [formData, setFormData] = useState({
    selectedTechId: "",
    note: "",
  });

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await getAllAdminTickets();
      setTickets(res.data || []);
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const res = await getTechnicians();
      setTechnicians(res.data || []);
    } catch {
      toast.error("Failed to load technicians");
    }
  };

  useEffect(() => {
    loadTickets();
    loadTechnicians();
  }, []);

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
    setFormData({ selectedTechId: "", note: "" });
  };

  const handleStatusSelect = (id, newStatus) => {
    if (newStatus === "REJECTED") {
      setActiveAction({ id, type: "REJECTED" });
    }
  };

  const handleSubmitAction = async (e, ticketId) => {
    e.preventDefault();

    try {
      if (activeAction.type === "ASSIGN") {
        const selectedTech = technicians.find(
          (tech) => String(tech.id) === String(formData.selectedTechId)
        );

        if (!selectedTech) {
          toast.error("Please select a technician");
          return;
        }

        await assignTech(ticketId, selectedTech.id, selectedTech.name);
        toast.success("Technician assigned");
      } else if (activeAction.type === "REJECTED") {
        await rejectTicket(ticketId, formData.note);
        toast.success("Ticket rejected");
      }

      closeForm();
      loadTickets();
    } catch {
      toast.error("Action failed");
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const title = t.title || "";
    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === "" || t.status === filterStatus)
    );
  });

  if (loading) {
    return (
      <div className="page-container">
        <p className="page-subtitle">Loading admin tickets...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header ticket-admin-hero">
        <div>
          <h1 className="page-title">Ticket Handling</h1>
          <p className="page-subtitle">
            Assign technicians and manage UniGo support tickets
          </p>
        </div>

        <div className="stats-mini">
          <span className="total-label">Total Tickets</span>
          <span className="total-badge">{tickets.length}</span>
        </div>
      </header>

      <div className="toolbar ticket-toolbar">
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
        {filteredTickets.length === 0 ? (
          <div className="empty-card">No tickets found.</div>
        ) : (
          filteredTickets.map((ticket) => (
            <div key={ticket.id} className="admin-ticket-card">
              <div className="admin-card-body">
                <div className="header-row">
                  <span className="ticket-id-tag">TICKET #{ticket.id}</span>

                  <select
                    className={`status-dropdown-pill ${getStatusClass(ticket.status)}`}
                    value={ticket.status}
                    onChange={(e) => handleStatusSelect(ticket.id, e.target.value)}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <h3>{ticket.title}</h3>

                <p className="description-text">
                  Resource: {ticket.resourceName || "N/A"}
                </p>

                <p className="description-text">
                  Location: {ticket.location || "N/A"}
                </p>

                <div className="admin-meta-grid">
                  <div className="meta-item">
                    <label>Priority</label>
                    <span className={`tag ${getPriorityClass(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>

                  <div className="meta-item">
                    <label>Assigned To</label>
                    <span className="tech-name">
                      {ticket.technicianName || "Unassigned"}
                    </span>
                  </div>
                </div>

                {activeAction.id === ticket.id ? (
                  <form
                    onSubmit={(e) => handleSubmitAction(e, ticket.id)}
                    className="inline-action-form"
                  >
                    {activeAction.type === "ASSIGN" ? (
                      <select
                        required
                        value={formData.selectedTechId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            selectedTechId: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Technician</option>
                        {technicians.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.name} - {tech.email}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <textarea
                        placeholder="Reason for rejection..."
                        required
                        value={formData.note}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            note: e.target.value,
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
          ))
        )}
      </div>

      <style>{`
        .ticket-admin-hero {
          padding: 40px 48px;
          border-radius: 30px;
          background:
            linear-gradient(135deg, rgba(255,47,146,0.24), rgba(139,61,255,0.28)),
            rgba(18,18,30,0.86);
          border: 1px solid rgba(255,255,255,0.13);
          box-shadow: 0 24px 70px rgba(0,0,0,0.35);
        }

        .ticket-toolbar {
          padding: 22px;
          border-radius: 24px;
          background: rgba(24,24,38,0.82);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 18px 48px rgba(0,0,0,0.25);
        }

        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(390px, 1fr));
          gap: 24px;
          margin-top: 26px;
        }

        .admin-ticket-card {
          border-radius: 28px;
          background:
            radial-gradient(circle at top left, rgba(255,47,146,0.15), transparent 34%),
            radial-gradient(circle at bottom right, rgba(139,61,255,0.18), transparent 38%),
            rgba(18,18,30,0.9);
          border: 1px solid rgba(255,255,255,0.13);
          box-shadow: 0 22px 60px rgba(0,0,0,0.32);
          transition: 0.25s ease;
          overflow: hidden;
        }

        .admin-ticket-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255,47,146,0.38);
        }

        .admin-card-body {
          padding: 26px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          margin-bottom: 28px;
        }

        .stats-mini {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-radius: 999px;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.14);
        }

        .total-label {
          color: rgba(255,255,255,0.72);
          font-size: 14px;
          font-weight: 800;
        }

        .total-badge {
          background: linear-gradient(135deg, #ff2f92, #8b3dff);
          color: white;
          padding: 7px 13px;
          border-radius: 999px;
          font-weight: 950;
          font-size: 14px;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .ticket-id-tag {
          color: rgba(255,255,255,0.72);
          font-weight: 950;
          letter-spacing: 0.6px;
        }

        .status-dropdown-pill {
          border: none;
          min-width: 145px;
          padding: 10px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
          outline: none;
        }

        .admin-ticket-card h3 {
          margin: 0 0 14px;
          color: #fff;
          font-size: 26px;
          font-weight: 950;
        }

        .description-text {
          margin: 8px 0;
          color: rgba(255,255,255,0.68);
          font-weight: 650;
        }

        .admin-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 22px 0;
        }

        .meta-item {
          padding: 16px;
          border-radius: 18px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          text-align: center;
        }

        .meta-item label {
          display: block;
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          font-weight: 900;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .tag,
        .tech-name {
          display: block;
          font-weight: 950;
          color: #fff;
        }

        .inline-action-form {
          padding: 16px;
          border-radius: 20px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .inline-action-form select,
        .inline-action-form textarea {
          width: 100%;
          padding: 13px 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(10,10,18,0.72);
          color: #fff;
          font-size: 15px;
          outline: none;
        }

        .inline-action-form select option {
          background: #171426;
          color: #fff;
        }

        .inline-action-form textarea {
          min-height: 80px;
          resize: vertical;
        }

        .form-buttons {
          display: flex;
          gap: 10px;
        }

        .btn-confirm,
        .btn-cancel,
        .btn-assign {
          border: none;
          color: white;
          cursor: pointer;
          font-weight: 950;
          border-radius: 15px;
          padding: 14px;
        }

        .btn-confirm {
          flex: 2;
          background: linear-gradient(135deg, #ff2f92, #8b3dff);
        }

        .btn-cancel {
          flex: 1;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.14);
        }

        .btn-assign {
          width: 100%;
          background: linear-gradient(135deg, #ff2f92, #8b3dff);
          box-shadow: 0 16px 35px rgba(255,47,146,0.2);
        }

        .badge-open {
          background: #dcfce7;
          color: #15803d;
        }

        .badge-progress {
          background: #fef3c7;
          color: #b45309;
        }

        .badge-resolved {
          background: #dcfce7;
          color: #15803d;
        }

        .badge-rejected {
          background: #fee2e2;
          color: #b91c1c;
        }

        .badge-closed {
          background: #e2e8f0;
          color: #475569;
        }

        .priority-high {
          color: #fca5a5;
        }

        .priority-med {
          color: #fcd34d;
        }

        .priority-low {
          color: #86efac;
        }

        .empty-card {
          grid-column: 1 / -1;
          padding: 28px;
          border-radius: 22px;
          color: rgba(255,255,255,0.72);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
        }

        @media (max-width: 800px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .admin-grid {
            grid-template-columns: 1fr;
          }

          .admin-meta-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}