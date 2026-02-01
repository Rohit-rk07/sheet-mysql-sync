import express from "express";
import dotenv from "dotenv";
import sheetRoutes from "./routes/sheet.routes.js";
import syncRoutes from "./routes/sync.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

app.use("/sheet", sheetRoutes);
app.use("/sync", syncRoutes);



app.listen(4000, () => {
    console.log("Backend running on port 4000");
});
