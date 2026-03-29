// Prisma config for Prisma 7+
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DATABASE_URL for runtime, DIRECT_URL for migrations
    url: process.env["DATABASE_URL"] || "",
  },
});
