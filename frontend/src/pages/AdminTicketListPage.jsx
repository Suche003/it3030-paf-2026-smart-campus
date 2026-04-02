import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAllAdminTickets,
  assignTech,
  updateStatus,
  resolveTicket,
  rejectTicket
} from "../services/ticketService";

export default function AdminTicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all tickets
  const loadTickets = async () => {
    try {
      const res = await getAllAdminTickets();
      setTickets(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Assign Technician
  const handleAssign = async (id) => {
    const techId = window.prompt("Enter Technician ID");
    const techName = window.prompt("Enter Technician Name");

    if (!techId || !techName) {
      toast.error("Technician details required");
      return;
    }

    try {
      await assignTech(id, techId, techName);
      toast.success("Technician assigned successfully");
      loadTickets();
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign technician");
    }
  };

  // Change Status
  const handleStatus = async (id) => {
    const status = window.prompt(
      "Enter Status:\nOPEN\nIN_PROGRESS\nRESOLVED\nCLOSED\nREJECTED"
    );

    if (!status) return;

    try {
      await updateStatus(id, status.toUpperCase());
      toast.success("Status updated successfully");
      loadTickets();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  // Add Resolution
  const handleResolve = async (id) => {
    const note = window.prompt("Enter Resolution Note");

    if (!note) {
      toast.error("Resolution note required");
      return;
    }

    try {
      await resolveTicket(id, note);
      toast.success("Resolution note added");
      loadTickets();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add resolution");
    }
  };

  // Reject Ticket
  const handleReject = async (id) => {
    const reason = window.prompt("Enter Rejection Reason");

    if (!reason) {
      toast.error("Rejection reason required");
      return;
    }

    try {
      await rejectTicket(id, reason);
      toast.success("Ticket rejected successfully");
      loadTickets();
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject ticket");
    }
  };

  if (loading) {
    return <h2 style={{ padding: "20px" }}>Loading tickets...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Ticket Management</h1>

      {tickets.length === 0 ? (
        <p>No tickets found</p>
      ) : (
        tickets.map((ticket) => (
          <div
            key={ticket.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "15px"
            }}
          >
            <h3>{ticket.title}</h3>

            <p>
              <strong>Description:</strong> {ticket.description}
            </p>

            <p>
              <strong>Status:</strong> {ticket.status}
            </p>

            <p>
              <strong>Priority:</strong> {ticket.priority}
            </p>

            <p>
              <strong>Technician:</strong>{" "}
              {ticket.technicianName || "Not Assigned"}
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "10px"
              }}
            >
              <button onClick={() => handleAssign(ticket.id)}>
                Assign Technician
              </button>

              <button onClick={() => handleStatus(ticket.id)}>
                Change Status
              </button>

              <button onClick={() => handleResolve(ticket.id)}>
                Add Resolution
              </button>

              <button onClick={() => handleReject(ticket.id)}>
                Reject Ticket
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}