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
    api.post("/sync/run");

export const getHealth = () =>
    api.get("/health");

export const getSyncLogs = (limit = 10) =>
    api.get(`/sync/logs?limit=${limit}`);

export const getSheetPreview = (sheetId = "1qmZeG_tthIQhJdSrz6JtuokPAEtAdBRf2_dBBBK0zPw", sheetName = "Sheet1") =>
    api.get(`/sheet/preview?sheetId=${sheetId}&sheetName=${sheetName}`);

export default api;
