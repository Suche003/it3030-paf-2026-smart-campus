import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
  getStudentTickets,
  deleteTicket,
  updateTicket
} from "../services/ticketService";

import {
  addComment,
  getCommentsByTicket,
  updateComment,
  deleteComment
} from "../services/commentService";

export default function StudentTicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});

  const studentId = 1;

  //  LOAD DATA 
  const loadTickets = async () => {
    try {
      const res = await getStudentTickets(studentId);
      const ticketsData = res.data;

      setTickets(ticketsData);

      const results = await Promise.all(
        ticketsData.map((ticket) =>
          getCommentsByTicket(ticket.id).then((res) => ({
            ticketId: ticket.id,
            comments: res.data
          }))
        )
      );

      const map = {};
      results.forEach((r) => {
        map[r.ticketId] = r.comments;
      });

      setCommentsMap(map);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load tickets");
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  //  DELETE TICKET 
  const handleDeleteTicket = async (id) => {
    if (!window.confirm("Delete this ticket?")) return;

    try {
      await deleteTicket(id);
      toast.success("Ticket deleted");
      loadTickets();
    } catch (err) {
      console.log(err);
      toast.error("Delete failed (only OPEN tickets allowed)");
    }
  };

  //  EDIT TICKET 
  const handleEditTicket = async (ticket) => {
    const title = prompt("Edit title", ticket.title);
    const description = prompt("Edit description", ticket.description);
    const priority = prompt("Edit priority", ticket.priority);

    if (!title || !description) return;

    try {
      await updateTicket(ticket.id, {
        ...ticket,
        title,
        description,
        priority
      });

      toast.success("Ticket updated");
      loadTickets();
    } catch (err) {
      console.log(err);
      toast.error("Update failed");
    }
  };

  //  ADD COMMENT 
  const handleAddComment = async (ticketId) => {
    const text = prompt("Enter comment");
    if (!text) return;

    try {
      const res = await addComment(ticketId, {
        text,
        userId: studentId
      });

      setCommentsMap((prev) => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), res.data]
      }));

      toast.success("Comment added");
    } catch (err) {
      console.log(err);
      toast.error("Comment failed");
    }
  };

  //  EDIT COMMENT 
  const handleEditComment = async (comment, ticketId) => {
    const text = prompt("Edit comment", comment.text);
    if (!text) return;

    try {
      await updateComment(comment.id, { text });

      setCommentsMap((prev) => ({
        ...prev,
        [ticketId]: prev[ticketId].map((c) =>
          c.id === comment.id ? { ...c, text } : c
        )
      }));

      toast.success("Comment updated");
    } catch {
      toast.error("Update failed");
    }
  };

  //  DELETE COMMENT 
  const handleDeleteComment = async (commentId, ticketId) => {
    try {
      await deleteComment(commentId);

      setCommentsMap((prev) => ({
        ...prev,
        [ticketId]: prev[ticketId].filter((c) => c.id !== commentId)
      }));

      toast.success("Comment deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  //  UI 
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Tickets</h1>

        <Link to="/student/tickets/create">
          <button>Add Ticket</button>
        </Link>
      </div>

      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "10px"
          }}
        >
          {/*  TICKET INFO  */}
          <h3>{ticket.title}</h3>
          <p>{ticket.description}</p>

          <p><b>Status:</b> {ticket.status}</p>
          <p><b>Priority:</b> {ticket.priority}</p>

          {ticket.resolutionNote && (
            <p style={{ color: "green" }}>
              <b>Resolution:</b> {ticket.resolutionNote}
            </p>
          )}

          {/*  TICKET ACTIONS  */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => handleEditTicket(ticket)}>
              Edit Ticket
            </button>

            <button onClick={() => handleDeleteTicket(ticket.id)}>
              Delete Ticket
            </button>
          </div>

          {/* ================= COMMENTS ================= */}
          <div style={{ marginTop: "10px" }}>
            <h4>Comments</h4>

            {(commentsMap[ticket.id] || []).map((c) => (
              <div
                key={c.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "5px",
                  marginBottom: "5px"
                }}
              >
                <p>{c.text}</p>

                <button onClick={() => handleEditComment(c, ticket.id)}>
                  Edit
                </button>

                <button onClick={() => handleDeleteComment(c.id, ticket.id)}>
                  Delete
                </button>
              </div>
            ))}

            <button onClick={() => handleAddComment(ticket.id)}>
              Add Comment
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}