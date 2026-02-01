import "dotenv/config";

import express from "express";
import cookieParse from "cookie-parser"
import apiRouter from "./api/routes/index.js"
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParse())

app.use("/api", apiRouter);

app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
})