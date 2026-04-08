export const mockEnv = {
  NODE_ENV: "test",
  PORT: 3000,
  JWT_SECRET: "test_secret_that_is_long_enough_32chars",
  HASH_SALT_ROUNDS: 12,
  DATABASE_URL: "postgresql://user:password@localhost:5432/dbname",
  JWT_ACCESS_TOKEN_EXPIRATION: "15m",
  JWT_REFRESH_TOKEN_EXPIRATION: "7d",
  OTP_CODE_EXPIRATION_MINUTES: 10,
};
