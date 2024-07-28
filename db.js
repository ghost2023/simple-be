const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient({ log: ["error"] });

export default db;
