/** @jest-environment node */
// Simula el servidor de Next.js, donde no existe window; lib/auth.ts debe no fallar.
import { getToken, setToken, clearToken } from "../lib/auth";

describe("auth (servidor)", () => {
  describe("getToken", () => {
    it("getToken devuelve null en el servidor", () => {
      // Arrange: no existe window (entorno node)

      // Act + Assert: getToken devuelve null
      expect(getToken()).toBeNull();
    });
  });

  describe("setToken y clearToken", () => {
    it("setToken y clearToken no fallan en el servidor", () => {
      // Arrange: no existe window (entorno node)

      // Act + Assert: setToken no lanza error
      expect(() => setToken("abc")).not.toThrow();

      // Act + Assert: clearToken no lanza error
      expect(() => clearToken()).not.toThrow();
    });
  });
});
