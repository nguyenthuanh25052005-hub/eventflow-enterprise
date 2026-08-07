import client from './client';
export const eventRequestApi={
 list:(params={})=>client.get('/event-requests',{params}).then(r=>r.data),
 get:(id)=>client.get(`/event-requests/${id}`).then(r=>r.data),
 create:(data)=>client.post('/event-requests',data).then(r=>r.data),
 update:(id,data)=>client.put(`/event-requests/${id}`,data).then(r=>r.data),
 convert:(id)=>client.post(`/event-requests/${id}/convert`).then(r=>r.data)
};
