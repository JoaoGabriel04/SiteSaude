import "dotenv/config";
import express from "express";

const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", (await import("./api/routes/index.js")).default);

app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
})