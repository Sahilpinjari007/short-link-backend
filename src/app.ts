import express from "express";
import errorMiddleware from "./middleware/error.middleware";
import cookieParser from "cookie-parser";

const app = express();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", true)

import authRoute from "./routes/auth.route";
import linkRoute from "./routes/link.routes";
import analyticsRoute from "./routes/analytics.route";
import qrRoute from "./routes/qr.route";
import redirectRoute from "./routes/redirect.route";
import campaignRoute from "./routes/campaign.route";

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/link", linkRoute);
app.use("/api/v1/analytics", analyticsRoute)
app.use("/api/v1/qr", qrRoute)
app.use("/api/v1/redirect", redirectRoute)
app.use("/api/v1/campaign", campaignRoute)


app.get("/", (req, res) => {
  res.send("<h1>Welcome to ShortLink Server!</h1>");
});

app.use(errorMiddleware);
export default app;
