import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import db from "./db.js";

const app = express();
dotenv.config();

app.use(express.json());

app.get("/me", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.json({ user: null });

  const payload = jwt.verify(token, "secret");

  res.json({ user: payload });
});

app.post("/signup", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    const user = await db.user.create({
      data: {
        first_name,
        last_name,
        email,
        password,
      },
    });

    const token = jwt.sign(user, "secret");

    res.json({ user, token });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.user.findFirst({
      where: {
        email,
        password,
      },
    });

    if (!user)
      return res.status(400).json({ error: "incorrect email or password" });

    const token = jwt.sign(user, "secret");

    res.json({ user, token });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
});

app.get("/products", async (req, res) => {
  try {
    const cat = req.query["catagory"];

    let catagoryIds = [];

    if (Array.isArray(cat)) catagoryIds = cat;
    else if (typeof cat === "string") catagoryIds.push(cat);

    console.log(catagoryIds);

    const products = await db.product.findMany({
      where: {
        ProductCatagory: {
          some: {
            catagory_id: {
              in: catagoryIds.map((i) => +i),
            },
          },
        },
      },
    });
    res.json({ products });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
});

app.listen(5000, () => {
  console.log("listening on port 5000");
});
