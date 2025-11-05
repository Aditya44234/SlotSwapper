import api from "./axios"

export const login = (email, password) =>
    api.post('/api/auth/login', { email, password });


export const signup = (name, email, password) =>
    api.post('/api/auth/signup', { name, email, password });



//  Events apis
export const fetchEvents = () => api.get('/api/events');
export const createEvent = event => api.post('/api/events', event);
export const updateEvent = (id, date) => api.put(`/api/events/${id}`, data);
export const deleteEvent = id => api.delete(`/api/events/${id}`);


//  Swapping APIs
export const getSwappableSlots = () => api.get('/api/swappable-slots');
export const createSwapRequest = (mySlotId, theirSlotId) =>
    api.post(`/api/swap-request`, { mySlotId, theirSlotId });

export const respondToSwap = (requestId, accept) =>
    api.post(`/api/swap-response/${requestId}`, { accept });

export const getSwapRequests = () => api.get('/api/swap-requests');


