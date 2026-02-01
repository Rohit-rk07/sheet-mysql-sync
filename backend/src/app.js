import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import sheetRoutes from "./routes/sheet.routes.js";
import syncRoutes from "./routes/sync.routes.js";
import schedulerRoutes from "./routes/scheduler.routes.js";

const app = express();
app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173"
}));

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

app.use("/sheet", sheetRoutes);
app.use("/sync", syncRoutes);
app.use("/scheduler", schedulerRoutes);

app.listen(4000, () => {
    console.log("Backend running on port 4000");

});
