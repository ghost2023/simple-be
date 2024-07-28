import express from "express";
import jwt from "jsonwebtoken";
import db from "./db.js";

const app = express();

app.use(express.json());

app.get("/me", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.json({ user: null });

  const payload = jwt.verify(token, "");

  res.json({ user: payload });
});





app.listen(5000, () => {
  console.log("listening on port 5000");
});
