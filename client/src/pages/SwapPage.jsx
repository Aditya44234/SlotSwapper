import React, { useState, useEffect } from "react";
import {
  getSwappableSlots,
  createSwapRequest,
  getSwapRequests,
  respondToSwap,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

const SwapPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch swappable events and swap requests on mount
  useEffect(() => {
    const loadSwappables = async () => {
      setLoading(true);
      setError(null);
      try {
        const slotsRes = await getSwappableSlots();
        // Only show events not owned by current user:
        const filteredSlots = (slotsRes.data || slotsRes).filter(
          e => e.userId && e.userId._id !== user._id
        );
        setEvents(filteredSlots);
        const swapsRes = await getSwapRequests();
        setSwapRequests(swapsRes.data.requests || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load swap info");
      }
      setLoading(false);
    };
    loadSwappables();
  }, [user?._id]);

  // Request a swap
  const handleRequestSwap = async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createSwapRequest(eventId);
      setSwapRequests([...swapRequests, res.data]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to request swap");
    }
    setLoading(false);
  };

  // Respond to swap (accept/reject)
  const handleRespondSwap = async (requestId, accept) => {
    setLoading(true);
    setError(null);
    try {
      await respondToSwap(requestId, accept);
      setSwapRequests(swapRequests.filter((r) => r._id !== requestId));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to respond to swap");
    }
    setLoading(false);
  };

  // Format date helper
  const formatDateTime = (dt) =>
    new Date(dt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-12">
      <div className="w-full max-w-[700px] bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Swappable Events
        </h2>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="flex flex-col gap-4 mb-6">
            {events.length === 0 ? (
              <div className="text-gray-500">No swappable events found.</div>
            ) : (
              events.map((event) => (
                <div
                  key={event._id}
                  className="border p-4 rounded bg-gray-50 flex flex-col"
                >
                  <div className="font-bold">{event.title}</div>
                  <div>
                    <strong>Owner:</strong> {event.userId.name} ({event.userId.email})
                  </div>
                  <div>
                    <strong>Start:</strong> {formatDateTime(event.startTime)}
                  </div>
                  <div>
                    <strong>End:</strong> {formatDateTime(event.endTime)}
                  </div>
                  <div>
                    <strong>Status:</strong> {event.status}
                  </div>
                  <div>
                    <strong>Created:</strong> {formatDateTime(event.createdAt)}
                  </div>
                  <button
                    className="mt-2 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-700 text-sm w-fit"
                    onClick={() => handleRequestSwap(event._id)}
                    disabled={loading}
                  >
                    Request Swap
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <h3 className="text-xl font-bold mt-8 mb-4">Pending Swap Requests</h3>
        {swapRequests.length === 0 ? (
          <div className="text-gray-500">No swaps pending.</div>
        ) : (
          swapRequests.map((request) => (
            <div
              key={request._id}
              className="border p-4 rounded bg-yellow-50 flex flex-col mb-2"
            >
              <div className="font-bold">
                Request for Event: {request.eventTitle}
              </div>
              <div>From: {request.requesterName}</div>
              <div>Status: {request.status}</div>
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-700 text-sm"
                  onClick={() => handleRespondSwap(request._id, true)}
                  disabled={loading}
                >
                  Accept
                </button>
                <button
                  className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-700 text-sm"
                  onClick={() => handleRespondSwap(request._id, false)}
                  disabled={loading}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SwapPage;
