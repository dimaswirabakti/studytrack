import express from "express";
import { env } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import devRoutes from "./routes/dev.js";
import taskRoutes from "./routes/tasks.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

// get /api/health cek apakah server sedang berjalan
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "StudyTrack backend is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/tasks", taskRoutes);

// endpoint reset tanpa login tidak boleh ada di production
if (env.NODE_ENV !== "production") {
  app.use("/api/dev", devRoutes);
}

app.use(notFoundHandler);
app.use(errorHandler);

// default export dipakai vercel sebagai entrypoint function
export default app;
