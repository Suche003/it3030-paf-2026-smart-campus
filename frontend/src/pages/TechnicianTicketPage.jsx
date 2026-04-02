import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  getMyTechTickets,
  updateTechStatus,
  addResolution
} from "../services/technicianTicketService";

export default function TechnicianTicketPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Kasun = technicianId 1
  const techId = 1;

  //  LOAD TICKETS 
  const loadTickets = async () => {
    try {
      setLoading(true);

      const res = await getMyTechTickets(techId);

      // safe fallback
      setTickets(Array.isArray(res.data) ? res.data : []);

    } catch (err) {
      console.log("ERROR:", err);
      toast.error("Failed to load tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  //  STATUS UPDATE 
  const handleStatus = async (id, status) => {
    try {
      await updateTechStatus(id, status);
      toast.success("Status updated");
      loadTickets();
    } catch {
      toast.error("Status update failed");
    }
  };

  //  RESOLVE 
  const handleResolve = async (id) => {
    const note = prompt("Enter resolution note");
    if (!note) return;

    try {
      await addResolution(id, note);
      await updateTechStatus(id, "RESOLVED");

      toast.success("Ticket resolved");
      loadTickets();
    } catch {
      toast.error("Failed to resolve");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Technician Dashboard (Kasun)</h1>

      {loading && <p>Loading tickets...</p>}

      {!loading && tickets.length === 0 && (
        <p>No assigned tickets</p>
      )}

      {tickets.map((t) => (
        <div
          key={t.id}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 10,
            borderRadius: 10
          }}
        >
          <h3>{t.title}</h3>
          <p>{t.description}</p>

          <p><b>Status:</b> {t.status}</p>
          <p><b>Priority:</b> {t.priority}</p>
          <p><b>Location:</b> {t.location}</p>

          {/* RESOLUTION */}
          {t.resolutionNote && (
            <p style={{ color: "green" }}>
              <b>Resolution:</b> {t.resolutionNote}
            </p>
          )}

          {/* ACTIONS */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => handleStatus(t.id, "IN_PROGRESS")}>
              Start Work
            </button>

            <button onClick={() => handleStatus(t.id, "IN_PROGRESS")}>
              In Progress
            </button>

            <button onClick={() => handleStatus(t.id, "RESOLVED")}>
              Mark Resolved
            </button>

            <button onClick={() => handleResolve(t.id)}>
              Add Resolution
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}