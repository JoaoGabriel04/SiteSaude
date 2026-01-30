import 'dotenv/config';
import express from "express";
import cookieParse from "cookie-parser"
import apiRouter from "./api/routes/index.js"
import routerAtedent from "./api/routes/atedente.route.js"

const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParse())

app.use("/api", apiRouter);
app.use("/api/atend", routerAtedent)
app.get("/test", (req, res)=>{
  res.send("API is running");
})

app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
})