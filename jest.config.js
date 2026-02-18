/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests/jest"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/app/api/marz/**/*.ts",
    "src/app/api/auth/**/*.ts",
  ],
  coverageDirectory: "coverage/jest",
};

module.exports = config;
