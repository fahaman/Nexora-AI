import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongoUri: required("MONGO_URI", "mongodb://localhost:27017/nexora"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET", "dev-access-secret-change-me"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET", "dev-refresh-secret-change-me"),
  accessTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
  refreshTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7),
  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  seedOnRegister: (process.env.SEED_ON_REGISTER ?? "true") === "true",
};
