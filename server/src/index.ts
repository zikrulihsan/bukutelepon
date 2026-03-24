import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import authRouter from "./modules/auth/auth.router";
import contactsRouter from "./modules/contacts/contacts.router";
import citiesRouter from "./modules/cities/cities.router";
import categoriesRouter from "./modules/categories/categories.router";
import reviewsRouter from "./modules/reviews/reviews.router";
import guestRouter from "./modules/guest/guest.router";
import adminRouter from "./modules/admin/admin.router";

const app = express();
const PORT = process.env.PORT || 3000;

// Trust nginx proxy (required for express-rate-limit behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:5173")
      .split(",")
      .map((u) => u.trim()),
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Route mounting
app.use("/api/auth", authRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/cities", citiesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/guest", guestRouter);
app.use("/api/admin", adminRouter);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
