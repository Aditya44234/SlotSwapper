import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

const formatDateTime = (dt) =>
  new Date(dt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const EventCard = ({ event, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(event.title);
  const [editStart, setEditStart] = useState(event.startTime);
  const [editEnd, setEditEnd] = useState(event.endTime);
  const [editStatus, setEditStatus] = useState(event.status);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onEdit(event._id, {
      title: editTitle,
      startTime: editStart,
      endTime: editEnd,
      status: editStatus,
    });
    setIsEditing(false);
  };

  return (
    <div className="border rounded p-4 bg-gray-50 shadow mb-2 flex flex-col relative">
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="datetime-local"
            value={editStart}
            onChange={(e) => setEditStart(e.target.value)}
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="datetime-local"
            value={editEnd}
            onChange={(e) => setEditEnd(e.target.value)}
            className="border rounded px-2 py-1"
            required
          />
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            className="border rounded px-2 py-1"
            required
          >
            <option value="BUSY">Busy</option>
            <option value="SWAPPABLE">Swappable</option>
            <option value="SWAP_PENDING">Swap Pending</option>
          </select>

          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700 text-sm"
            >
              Save
            </button>
            <button
              type="button"
              className="bg-gray-300 text-black py-1 px-3 rounded hover:bg-gray-400 text-sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="text-lg font-bold mb-2">{event.title}</div>
          <div className="text-sm text-gray-700 mb-1">
            <span className="font-medium">Start:</span>{" "}
            {formatDateTime(event.startTime)}
          </div>
          <div className="text-sm text-gray-700 mb-1">
            <span className="font-medium">End:</span>{" "}
            {formatDateTime(event.endTime)}
          </div>
          <div className="text-sm text-gray-700 mb-1">
            <span className="font-medium">Status:</span> {event.status}
          </div>
          <div className="text-xs text-gray-500 mb-1">
            <span className="font-medium">Created:</span>{" "}
            {formatDateTime(event.createdAt)}
          </div>
          <div className="absolute top-2 right-2 flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800"
              title="Edit Event"
            >
              <Pencil size={20} />
            </button>
            <button
              onClick={() => onDelete(event._id)}
              className="text-red-600 hover:text-red-800"
              title="Delete Event"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EventCard;
