import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import authRouter from "./modules/auth/auth.router";
import contactsRouter from "./modules/contacts/contacts.router";
import citiesRouter from "./modules/cities/cities.router";
import categoriesRouter from "./modules/categories/categories.router";
import reviewsRouter from "./modules/reviews/reviews.router";
import guestRouter from "./modules/guest/guest.router";
import adminRouter from "./modules/admin/admin.router";
import proRouter from "./modules/pro/pro.router";
import storefrontRouter from "./modules/storefront/storefront.router";
import heroPromotionsRouter from "./modules/hero-promotions/hero-promotions.router";

const app = express();

// Functions run behind Netlify's proxy; the local Express server may also sit
// behind nginx. This makes rate limiting use the real client IP in both cases.
app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:5173")
      .split(",")
      .map((url) => url.trim()),
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/cities", citiesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/guest", guestRouter);
app.use("/api/admin", adminRouter);
app.use("/api/pro", proRouter);
app.use("/api/storefront", storefrontRouter);
app.use("/api/hero-promotions", heroPromotionsRouter);

app.use(errorHandler);

export default app;
