import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests/jest"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/app/api/marz/**/*.ts",
    "src/app/api/auth/**/*.ts",
  ],
  coverageDirectory: "coverage/jest",
};

export default config;
