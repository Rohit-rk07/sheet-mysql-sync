import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:4000",
});

export const startScheduler = () =>
    api.post("/scheduler/start");

export const stopScheduler = () =>
    api.post("/scheduler/stop");

export const getSchedulerStatus = () =>
    api.get("/scheduler/status");

export const runManualSync = () =>
    api.post("/sync/run"); // we’ll add this backend route

export default api;
