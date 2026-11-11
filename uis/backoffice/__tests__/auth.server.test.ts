/** @jest-environment node */
// Simula el servidor de Next.js, donde no existe window; lib/auth.ts debe no fallar.
import { getToken, setToken, clearToken } from "../lib/auth";

describe("auth (servidor)", () => {
  describe("getToken", () => {
    it("getToken devuelve null en el servidor", () => {
      expect(getToken()).toBeNull();
    });
  });

  describe("setToken y clearToken", () => {
    it("setToken y clearToken no fallan en el servidor", () => {
      expect(() => setToken("abc")).not.toThrow();
      expect(() => clearToken()).not.toThrow();
    });
  });
});
