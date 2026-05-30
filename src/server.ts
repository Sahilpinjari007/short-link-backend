import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { startSubscriptionCorn } from "./jobs/subscription.job";

const startServer = async () => {
  await connectDB();
  startSubscriptionCorn();

  app.listen(env.PORT, () => {
    console.log(`ShortLink Server is running on port ${env.PORT}!`);
  });
};

startServer();