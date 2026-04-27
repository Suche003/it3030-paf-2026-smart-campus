import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getAllResources } from "../services/resourceService";
import { getUnavailableResourceIds } from "../services/bookingService";
import { getKindLabel, isEquipment } from "../utils/resourceOptions";
import "../styles/ResourceBrowse.css";

export default function ResourceBrowsePage() {
  const [resources, setResources] = useState([]);
  const [unavailableIds, setUnavailableIds] = useState([]);

  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const role =
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    localStorage.getItem("unipulse_role");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const res = await getAllResources();
      const activeOnly = res.data.filter((r) => r.status === "ACTIVE");
      setResources(activeOnly);
    } catch {
      toast.error("Failed to load resources");
    }
  };

  const checkAvailability = async () => {
    if (!bookingDate || !startTime || !endTime) {
      toast.error("Select date, start time and end time first");
      return;
    }

    if (bookingDate < today) {
      toast.error("Past dates are not allowed");
      return;
    }

    if (endTime <= startTime) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      const res = await getUnavailableResourceIds(
        bookingDate,
        startTime,
        endTime
      );

      setUnavailableIds(res.data);
      toast.success("Availability updated");
    } catch (err) {
      toast.error(err.response?.data || "Failed to check availability");
    }
  };

  const filteredResources = useMemo(() => {
    let data = [...resources];

    data = data.filter((r) => !unavailableIds.includes(r.id));

    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter((r) =>
        [
          r.name,
          r.codeName,
          r.resourceKind,
          r.label,
          r.type,
          r.location,
          String(r.capacity || ""),
          String(r.quantity || ""),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (filterBy && filterValue) {
      data = data.filter((r) => {
        if (filterBy === "resourceKind") return r.resourceKind === filterValue;
        if (filterBy === "label") return r.label === filterValue;
        if (filterBy === "type") return r.type === filterValue;

        if (filterBy === "capacity") {
          const value = r.capacity || r.quantity || 0;
          return value >= Number(filterValue);
        }

        return true;
      });
    }

    return data;
  }, [resources, unavailableIds, search, filterBy, filterValue]);

  const labels = [...new Set(resources.map((r) => r.label).filter(Boolean))];
  const types = [...new Set(resources.map((r) => r.type).filter(Boolean))];

  const getViewPath = (id) => {
    if (role === "LECTURER") return `/lecturer/resources/view/${id}`;
    return `/student/resources/view/${id}`;
  };

  const resetFilters = () => {
    setSearch("");
    setFilterBy("");
    setFilterValue("");
    setBookingDate("");
    setStartTime("");
    setEndTime("");
    setUnavailableIds([]);
  };

  return (
    <div className="browse-page">
      <div className="browse-hero">
        <div>
          <h1>Book Resources</h1>
          <p>
            Select your required date and time first. Already booked or pending
            venues will be hidden automatically.
          </p>
        </div>
      </div>

      <div className="browse-filter-panel">
        <input
          className="browse-search"
          type="date"
          min={today}
          value={bookingDate}
          onChange={(e) => {
            setBookingDate(e.target.value);
            setUnavailableIds([]);
          }}
        />

        <input
          className="browse-search"
          type="time"
          value={startTime}
          onChange={(e) => {
            setStartTime(e.target.value);
            setUnavailableIds([]);
          }}
        />

        <input
          className="browse-search"
          type="time"
          value={endTime}
          onChange={(e) => {
            setEndTime(e.target.value);
            setUnavailableIds([]);
          }}
        />

        <button className="browse-apply-btn" onClick={checkAvailability}>
          Check Availability
        </button>

        <button className="browse-reset-btn" onClick={resetFilters}>
          Reset
        </button>
      </div>

      <div className="browse-filter-panel">
        <input
          className="browse-search"
          placeholder="Search by name, code, kind, category, type, capacity"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="browse-select"
          value={filterBy}
          onChange={(e) => {
            setFilterBy(e.target.value);
            setFilterValue("");
          }}
        >
          <option value="">Filter By</option>
          <option value="resourceKind">Resource Kind</option>
          <option value="label">Category</option>
          <option value="type">Type</option>
          <option value="capacity">Capacity / Quantity</option>
        </select>

        {filterBy === "resourceKind" && (
          <select
            className="browse-select"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          >
            <option value="">Select</option>
            <option value="VENUE">Venue</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        )}

        {filterBy === "label" && (
          <select
            className="browse-select"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          >
            <option value="">Select</option>
            {labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        )}

        {filterBy === "type" && (
          <select
            className="browse-select"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          >
            <option value="">Select</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        )}

        {filterBy === "capacity" && (
          <input
            className="browse-search small"
            type="number"
            min="1"
            placeholder="Minimum"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        )}
      </div>

      <div className="browse-grid">
        {filteredResources.length === 0 ? (
          <p className="browse-empty">No available resources found.</p>
        ) : (
          filteredResources.map((resource) => {
            const equipment = isEquipment(resource.resourceKind);

            return (
              <div className="browse-card" key={resource.id}>
                <div className="browse-card-head">
                  <h2>{resource.name}</h2>
                  <span className="browse-code">{resource.codeName}</span>
                </div>

                <div className="browse-card-meta">
                  <span className={`browse-kind ${equipment ? "equipment" : "venue"}`}>
                    {getKindLabel(resource.resourceKind)}
                  </span>

                  <span className="browse-status">Active</span>
                </div>

                <div className="browse-info-row">
                  <span>{resource.type}</span>
                  <span>
                    {equipment ? "Qty" : "Cap"}:{" "}
                    {equipment ? resource.quantity : resource.capacity}
                  </span>
                </div>

                <p className="browse-location">{resource.location || "N/A"}</p>

                <Link to={getViewPath(resource.id)} className="browse-view-btn">
                  View Details
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}