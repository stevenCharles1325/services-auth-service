import express, { Express, Request, Response } from "express";
import SampleController from "#Controllers/sample.controller";

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.json({"message":"Express + TypeScript Server"});
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});