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

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/link", linkRoute);
app.use("/api/v1/analytics", analyticsRoute)


app.get("/", (req, res) => {
  res.send("<h1>Welcome to ShortLink Server!</h1>");
});

app.use(errorMiddleware);
export default app;
