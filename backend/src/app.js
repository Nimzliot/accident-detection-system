import cors from "cors";
import express from "express";
import helmet from "helmet";
import routes from "./routes/accidentRoutes.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true
    })
  );
  app.use(express.json());
  app.use("/api", routes);
  app.use(errorHandler);

  return app;
};
