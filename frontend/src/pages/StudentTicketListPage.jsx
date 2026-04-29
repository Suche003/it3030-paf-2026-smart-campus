import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getStudentTickets, deleteTicket } from "../services/ticketService";
import {
  addComment,
  getCommentsByTicket,
  updateComment,
  deleteComment,
} from "../services/commentService";

export default function StudentTicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [activeCommentId, setActiveCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [newCommentText, setNewCommentText] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [deletingTicketId, setDeletingTicketId] = useState(null);
  const [submittingCommentId, setSubmittingCommentId] = useState(null);

  const studentId = localStorage.getItem("userId") || 1;
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "OPEN": return "badge-open";
      case "IN_PROGRESS": return "badge-progress";
      case "CLOSED":
      case "RESOLVED": return "badge-closed";
      default: return "";
    }
  };

  const getPriorityClass = (priority) => {
    const p = priority?.toLowerCase();
    if (p === "medium") return "priority-med";
    return `priority-${p}`;
  };

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const res = await getStudentTickets(studentId);
      const ticketList = Array.isArray(res.data) ? res.data : [];
      setTickets(ticketList);

      const results = await Promise.all(
        ticketList.map((ticket) =>
          getCommentsByTicket(ticket.id).then((r) => ({
            ticketId: ticket.id,
            comments: Array.isArray(r.data) ? r.data : [],
          }))
        )
      );

      const map = {};
      results.forEach((r) => { map[r.ticketId] = r.comments; });
      setCommentsMap(map);
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPriorityFilter("");
  };

  const handleAddComment = async (ticketId) => {
    const text = newCommentText[ticketId];
    if (!text?.trim()) return;
    try {
      setSubmittingCommentId(ticketId);
      const res = await addComment(ticketId, { text, userId: studentId });
      setCommentsMap((prev) => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), res.data],
      }));
      setNewCommentText({ ...newCommentText, [ticketId]: "" });
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingCommentId(null);
    }
  };

  const saveEdit = async (comment, ticketId) => {
    if (!editText?.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    try {
      await updateComment(comment.id, { text: editText });
      setCommentsMap((prev) => ({
        ...prev,
        [ticketId]: prev[ticketId].map((c) =>
          c.id === comment.id ? { ...c, text: editText } : c
        ),
      }));
      setActiveCommentId(null);
      toast.success("Updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    try {
      setDeletingTicketId(ticketId);
      await deleteTicket(ticketId);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      toast.success("Ticket deleted");
    } catch {
      toast.error("Failed to delete ticket");
    } finally {
      setDeletingTicketId(null);
    }
  };

  const handleDeleteComment = async (commentId, ticketId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId);
      setCommentsMap((prev) => ({
        ...prev,
        [ticketId]: prev[ticketId].filter((c) => c.id !== commentId),
      }));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Fetching your support data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Support Hub</h1>
          <p className="page-subtitle">Manage and track your active tickets</p>
        </div>
        <Link to="/student/tickets/create" className="primary-link-btn">
          + Create Ticket
        </Link>
      </header>

      {/* FILTERS SECTION */}
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
        <button className="reset-btn" onClick={resetFilters}>Reset</button>
      </div>

      <div className="tickets-stack">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="ticket-group-container">
            
            {/* TICKET CARD */}
            <div className="card ticket-card">
              <div className="ticket-card-header">
                <div className="title-area">
                  <span className="ticket-id-tag">#{ticket.id}</span>
                  <h3>{ticket.title}</h3>
                  <small style={{ color: "#fefcfc", fontSize: '16px'}}>
                    Resource: {ticket.resourceName || "N/A"}
                  </small>
                </div>
                <span className={`status-badge ${getStatusBadgeClass(ticket.status)}`}>
                  {ticket.status?.replace("_", " ")}
                </span>
              </div>


              {/* RESOLUTION NOTE */}
              {(ticket.status === "CLOSED" || ticket.status === "RESOLVED") && (
                <div className="resolution-note">
                  <strong>Resolution Note:</strong> {ticket.resolutionNote || "No resolution note provided"}
                </div>
              )}

              <div className="ticket-footer">
                <div className="meta-info">
                  <span className="tag category-tag">{ticket.category || "General"}</span>
                  <span className={`tag priority-tag ${getPriorityClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                
                {ticket.status === "OPEN" && (
                  <div className="actions">
                    <Link to={`/student/tickets/edit/${ticket.id}`} className="action-icon edit">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </Link>
                    <button 
                      onClick={() => handleDeleteTicket(ticket.id)} 
                      className="action-icon delete" 
                      disabled={deletingTicketId === ticket.id}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* COMMENTS CARD */}
            <div className="card comments-card">
              <div className="comments-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <h4>Activity & Comments ({commentsMap[ticket.id]?.length || 0})</h4>
              </div>

              <div className="comments-body">
                {(commentsMap[ticket.id] || []).length === 0 ? (
                  <div className="empty-comments">No discussion yet.</div>
                ) : (
                  commentsMap[ticket.id].map((c) => (
                    <div key={c.id} className="comment-bubble-wrapper">
                      {activeCommentId === c.id ? (
                        <div className="comment-edit-mode">
                          <textarea 
                            value={editText} 
                            onChange={(e) => setEditText(e.target.value)}
                            rows={2}
                          />
                          <div className="edit-buttons">
                            <button onClick={() => saveEdit(c, ticket.id)} className="save">Update</button>
                            <button onClick={() => setActiveCommentId(null)} className="cancel">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="comment-bubble">
                          <p>{c.text}</p>
                          <div className="bubble-footer">
                            <span>User #{c.userId || 'System'}</span>
                            {ticket.status === "OPEN" && (
                              <div className="bubble-actions">
                                <button onClick={() => { setActiveCommentId(c.id); setEditText(c.text); }}>Edit</button>
                                <button onClick={() => handleDeleteComment(c.id, ticket.id)}>Delete</button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {ticket.status !== "CLOSED" && (
                <div className="comment-input-area">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={newCommentText[ticket.id] || ""}
                    onChange={(e) => setNewCommentText({ ...newCommentText, [ticket.id]: e.target.value })}
                  />
                  <button 
                    onClick={() => handleAddComment(ticket.id)}
                    disabled={!newCommentText[ticket.id]?.trim() || submittingCommentId === ticket.id}
                  >
                    {submittingCommentId === ticket.id ? "..." : "Send"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .tickets-stack { display: flex; flex-direction: column; gap: 32px; margin-top: 24px; }
        .ticket-group-container { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; align-items: start; }
        .card { background: #303031; border-radius: 16px; border: 1px solid #838486; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; }
        .ticket-card { padding: 24px; min-height: 300px;}
        .ticket-card-header { display: flex; justify-content: space-between; margin-bottom: 18px; }
        .title-area h3 { margin: 0; font-size: 16px; color: #9ea0a3; margin-bottom: 18px; }
        .ticket-id-tag { font-size: 15px; color: #f8fafc; font-weight: 800; display: block; margin-bottom: 15px; }
        .ticket-description { color: #929395; line-height: 1.6; font-size: 12px; margin-bottom: 30px; }
        .resolution-note { margin-bottom: 30px; padding: 12px; background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 10px; color: #166534; font-size: 14px; }
        .ticket-footer { display: flex; justify-content: space-between; align-items: center; }
        .meta-info { display: flex; gap: 8px; }
        .tag { padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; }
        .category-tag { background: #f1f5f9; color: #475569; }
        .action-icon { padding: 8px; border-radius: 8px; border: none; background: #211f25; cursor: pointer; color: #f0f3f7; transition: 0.2s; display: flex; align-items: center; }
        .edit:hover { background: #e0e7ff; color: #4f46e5; }
        .delete:hover { background: #fee2e2; color: #ef4444; }
        .status-badge { font-size: 12px; font-weight: 700; padding: 8px 8px; border-radius: 12px; text-transform: uppercase; height: fit-content;}
        .badge-open { background: #dcfce7; color: #15803d; }
        .badge-progress { background: #fef3c7; color: #b45309; }
        .badge-closed { background: #e2e8f0; color: #475569; }
        .priority-high, .priority-critical { background: #fee2e2; color: #b91c1c; }
        .priority-med { background: #fff7ed; color: #c2410c; }
        .priority-low { background: #f0fdf4; color: #166534; }
        .comments-card { background: #303031; display: flex; flex-direction: column; height: 100%; min-height: 300px; }
        .comments-header { padding: 16px 20px; border-bottom: 1px solid #444; display: flex; align-items: center; gap: 10px; color: #fff; }
        .comments-body { padding: 20px; overflow-y: auto; max-height: 350px; flex-grow: 1; display: flex; flex-direction: column; gap: 12px; }
        .comment-bubble { background: #fff; padding: 12px; border-radius: 12px; }
        .comment-bubble p { margin: 0 0 8px 0; font-size: 14px; color: #333; }
        .bubble-footer { display: flex; justify-content: space-between; font-size: 11px; color: #999; }
        .bubble-actions button { border: none; background: none; color: #6366f1; cursor: pointer; font-weight: 600; padding: 0 4px; }
        .comment-input-area { padding: 15px; display: flex; gap: 10px; background: #3f3f40; border-top: 1px solid #444; }
        .comment-input-area input { flex-grow: 1; border-radius: 8px; border: 1px solid #555; padding: 8px 12px; background: #f9f9f9; }
        .comment-input-area button { background: #4f46e5; color: white; border: none; border-radius: 8px; padding: 0 16px; cursor: pointer; }
        @media (max-width: 900px) { .ticket-group-container { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}