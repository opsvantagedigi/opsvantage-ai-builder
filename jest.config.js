/** @type {import('jest').Config} */
const config = {
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

module.exports = config;
