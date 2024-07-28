import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import db from "./db.js";
import multer from "multer";
import bodyParser from "body-parser";

const app = express();
dotenv.config();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.get("/", express.static(path.join(__dirname, "./public")));

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

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

app.get("/products/new", upload.single("image"), async (req, res) => {
  try {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const payload = jwt.verify(token, "secret");

    if (!payload) return res.status(401).json({ error: "Unauthorized" });

    const image = req.file;
    const { name, location, price } = req.body;

    console.log(image, name);

    const product = await db.product.create({
      data: {
        name,
        location,
        price: +price,
        image: `/uploads/${image.filename}`,
        user_id: payload.id,
      },
    });

    res.json({ product });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
});

app.get("/catagories", async (req, res) => {
  try {
    const catagories = await db.catagory.findMany();
    res.json({ catagories });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
});

app.listen(5000, () => {
  console.log("listening on port 5000");
});
