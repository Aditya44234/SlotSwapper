import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../services/api";
import EventCard from "../components/EventCard";

const Events = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New event form state
  const [newTitle, setNewTitle] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newStatus, setNewStatus] = useState("BUSY");

  // Fetch events on mount
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchEvents();
        setEvents(res.data.event); // array of events
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch events");
      }
      setLoading(false);
    };
    loadEvents();
  }, []);

  // Handle new event creation
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createEvent({
        title: newTitle,
        startTime: newStartTime,
        endTime: newEndTime,
        status: newStatus,
      });
      setEvents([...events, res.data]);
      setNewTitle("");
      setNewStartTime("");
      setNewEndTime("");
      setNewStatus("BUSY");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create event");
    }
    setLoading(false);
  };

  const handleEdit = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateEvent(id, data);
      setEvents(events.map((e) => (e._id === id ? res.data : e)));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update event");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteEvent(id);
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete event");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-12">
      <div className="w-full max-w-[600px] bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">My Events</h2>
        <form className="flex flex-col gap-3 mb-8" onSubmit={handleCreate}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Event Title"
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-400"
            required
          />
          <input
            type="datetime-local"
            value={newStartTime}
            onChange={(e) => setNewStartTime(e.target.value)}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-400"
            required
          />
          <input
            type="datetime-local"
            value={newEndTime}
            onChange={(e) => setNewEndTime(e.target.value)}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-400"
            required
          />
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-400"
            required
          >
            <option value="BUSY">Busy</option>
            <option value="SWAPPABLE">Swappable</option>
            <option value="SWAP_PENDING">Swap Pending</option>
          </select>
          <button
            type="submit"
            className="bg-green-500 text-white py-2 rounded font-semibold hover:bg-green-600 transition"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div>Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-gray-500">No events found.</div>
          ) : (
            events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
