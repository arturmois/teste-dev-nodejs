import express from "express";
import routes from "./routes";
import cors from "cors";
import helmet from "helmet";
import envs from "./config/envs";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: envs.FRONTEND_URL,
    credentials: true,
  })
);
app.use(helmet());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api", routes);

export default app;
