/** @jest-environment jsdom */
// Simula un navegador con window.localStorage para probar lib/auth.ts en el cliente.
import { getToken, setToken, clearToken } from "../lib/auth";

describe("auth (cliente)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("setToken y getToken", () => {
    it("setToken guarda el token y getToken lo devuelve", () => {
      setToken("token-123");

      expect(getToken()).toBe("token-123");
    });

    it("setToken reemplaza un token anterior", () => {
      setToken("token-viejo");
      setToken("token-nuevo");

      expect(getToken()).toBe("token-nuevo");
    });

    it("getToken devuelve null si no hay sesión guardada", () => {
      expect(getToken()).toBeNull();
    });
  });

  describe("clearToken", () => {
    it("clearToken borra el token y getToken pasa a devolver null", () => {
      setToken("token-123");
      clearToken();

      expect(getToken()).toBeNull();
    });

    it("clearToken no falla si no había token guardado", () => {
      expect(() => clearToken()).not.toThrow();
      expect(getToken()).toBeNull();
    });
  });
});
