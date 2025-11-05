import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  createSwapRequest,
  getSwappableSlots,
  getSwapRequests,
  fetchEvents,
  respondToSwap,
} from "../services/api";

const SwapPage = () => {
  const { user } = useAuth();
  const [othersSlots, setOthersSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [selectedMySlot, setSelectedMySlot] = useState("");
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const formatDateTime = (dt) =>
    new Date(dt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // Fetch all data (matching backend controller logic)
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Fetch swappable slots from other users
      const slotsRes = await getSwappableSlots();
      const othersData = slotsRes.data || slotsRes;
      setOthersSlots(Array.isArray(othersData) ? othersData : []);

      // Fetch MY own events to get MY swappable slots
      const myEventsRes = await fetchEvents();
      const myEvents = myEventsRes.data || myEventsRes;
      const mySwappable = Array.isArray(myEvents)
        ? myEvents.filter(
            (e) =>
              e.status === "SWAPPABLE" &&
              e.userId &&
              String(e.userId._id || e.userId) === String(user._id)
          )
        : [];
      setMySwappableSlots(mySwappable);

      // Set first slot as selected if available
      if (mySwappable.length > 0 && !selectedMySlot) {
        setSelectedMySlot(mySwappable[0]._id);
      }

      // Fetch swap requests
      const reqRes = await getSwapRequests();
      const reqData = reqRes.data || reqRes;
      setIncomingRequests(reqData.incoming || []);
      setOutgoingRequests(reqData.outgoing || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.error || "Failed to load swap data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchAllData();
    }
    // eslint-disable-next-line
  }, [user?._id]);

  // Request a swap
  const handleRequestSwap = async (theirSlotId) => {
    if (!selectedMySlot) {
      setError("Please select your own SWAPPABLE slot first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createSwapRequest(selectedMySlot, theirSlotId);
      setSuccess("Swap request sent successfully!");
      await fetchAllData();
    } catch (err) {
      console.error("Swap request error:", err);
      setError(err.response?.data?.error || "Failed to create swap request");
    } finally {
      setLoading(false);
    }
  };

  // Respond to incoming swap request
  const handleRespondSwap = async (requestId, accept) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await respondToSwap(requestId, accept);
      setSuccess(accept ? "Swap accepted successfully!" : "Swap rejected.");
      await fetchAllData();
    } catch (err) {
      console.error("Swap response error:", err);
      setError(err.response?.data?.error || "Failed to respond to swap");
    } finally {
      setLoading(false);
    }
  };

  // Filter only PENDING incoming requests for you to respond
  const pendingIncoming = incomingRequests.filter(
    (req) => req.status === "PENDING"
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Slot Swapper
          </h1>
          <p className="text-gray-600">Exchange time slots with other users</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Select Your Slot Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your Swappable Slots
          </h2>

          {mySwappableSlots.length > 0 ? (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select a slot to offer for swap:
              </label>
              <select
                value={selectedMySlot}
                onChange={(e) => setSelectedMySlot(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {mySwappableSlots.map((slot) => (
                  <option key={slot._id} value={slot._id}>
                    {slot.title} • {formatDateTime(slot.startTime)} -{" "}
                    {formatDateTime(slot.endTime)}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                This slot will be offered when you request a swap with another
                user's slot.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>No swappable slots available.</strong>
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Go to "My Events" and mark a BUSY slot as SWAPPABLE to start
                requesting swaps.
              </p>
            </div>
          )}
        </div>

        {/* Available Slots from Other Users */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Available Slots from Other Users
          </h2>

          {loading && othersSlots.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading available slots...</p>
            </div>
          ) : othersSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>
                No swappable slots available from other users at the moment.
              </p>
              <p className="text-sm mt-2">
                Check back later or encourage others to mark their slots as
                swappable!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {othersSlots.map((slot) => (
                <div
                  key={slot._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    {slot.title}
                  </h3>

                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p>
                      <span className="font-semibold">Owner:</span>{" "}
                      {slot.userId?.name || "Unknown"}
                      {slot.userId?.email && ` (${slot.userId.email})`}
                    </p>
                    <p>
                      <span className="font-semibold">Start:</span>{" "}
                      {formatDateTime(slot.startTime)}
                    </p>
                    <p>
                      <span className="font-semibold">End:</span>{" "}
                      {formatDateTime(slot.endTime)}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>
                      <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                        {slot.status}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleRequestSwap(slot._id)}
                    disabled={loading || !selectedMySlot}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                      loading || !selectedMySlot
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {loading ? "Processing..." : "Request Swap"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Swap Requests */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Incoming Swap Requests
          </h2>

          {pendingIncoming.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending swap requests.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingIncoming.map((req) => (
                <div
                  key={req._id}
                  className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        Swap Request from{" "}
                        {req.requesterId?.name || "Unknown User"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {req.requesterId?.email}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-semibold">
                      {req.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        THEY OFFER:
                      </p>
                      <p className="font-semibold text-gray-800">
                        {req.mySlotId?.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {req.mySlotId?.startTime &&
                          formatDateTime(req.mySlotId.startTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {req.mySlotId?.endTime &&
                          formatDateTime(req.mySlotId.endTime)}
                      </p>
                    </div>
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        THEY WANT:
                      </p>
                      <p className="font-semibold text-gray-800">
                        {req.theirSlotId?.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {req.theirSlotId?.startTime &&
                          formatDateTime(req.theirSlotId.startTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {req.theirSlotId?.endTime &&
                          formatDateTime(req.theirSlotId.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRespondSwap(req._id, true)}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Accept Swap
                    </button>
                    <button
                      onClick={() => handleRespondSwap(req._id, false)}
                      disabled={loading}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Swap Requests */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your Outgoing Requests
          </h2>

          {outgoingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No outgoing swap requests.
            </div>
          ) : (
            <div className="space-y-4">
              {outgoingRequests.map((req) => (
                <div
                  key={req._id}
                  className={`border rounded-lg p-4 ${
                    req.status === "ACCEPTED"
                      ? "bg-green-50 border-green-300"
                      : req.status === "REJECTED"
                      ? "bg-red-50 border-red-300"
                      : "bg-blue-50 border-blue-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        Request to {req.recipientId?.name || "Unknown User"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {req.recipientId?.email}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        req.status === "ACCEPTED"
                          ? "bg-green-200 text-green-800"
                          : req.status === "REJECTED"
                          ? "bg-red-200 text-red-800"
                          : "bg-blue-200 text-blue-800"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        YOU OFFERED:
                      </p>
                      <p className="font-semibold text-gray-800">
                        {req.mySlotId?.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {req.mySlotId?.startTime &&
                          formatDateTime(req.mySlotId.startTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {req.mySlotId?.endTime &&
                          formatDateTime(req.mySlotId.endTime)}
                      </p>
                    </div>
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        YOU REQUESTED:
                      </p>
                      <p className="font-semibold text-gray-800">
                        {req.theirSlotId?.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {req.theirSlotId?.startTime &&
                          formatDateTime(req.theirSlotId.startTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {req.theirSlotId?.endTime &&
                          formatDateTime(req.theirSlotId.endTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwapPage;
