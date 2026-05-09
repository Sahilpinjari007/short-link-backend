import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`ShortLink Server is running on port ${env.PORT}!`);
  });
};

startServer();