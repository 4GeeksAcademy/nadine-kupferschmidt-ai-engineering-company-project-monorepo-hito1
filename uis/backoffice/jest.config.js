/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
  transform: {
    // El tsconfig de ts-jest solo aplica a los tests; la configuración de Next.js no es compatible con Jest.
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          moduleResolution: "node",
          jsx: "react-jsx",
          esModuleInterop: true,
        },
      },
    ],
  },
  collectCoverageFrom: ["lib/auth.ts"],
};
