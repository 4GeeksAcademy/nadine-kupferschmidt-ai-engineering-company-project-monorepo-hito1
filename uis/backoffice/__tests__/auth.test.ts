/** @jest-environment jsdom */
// Simula un navegador con window.localStorage para probar lib/auth.ts en el cliente.
import { getToken, setToken, clearToken } from "../lib/auth";

describe("auth (cliente)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("setToken y getToken", () => {
    it("setToken guarda el token y getToken lo devuelve", () => {
      // Arrange: localStorage vacío (lo limpia el beforeEach)

      // Act: guardar el token con setToken
      setToken("token-123");

      // Assert: getToken devuelve ese mismo token
      expect(getToken()).toBe("token-123");
    });

    it("setToken reemplaza un token anterior", () => {
      // Arrange: ya hay un token guardado
      setToken("token-viejo");

      // Act: guardar otro token con setToken
      setToken("token-nuevo");

      // Assert: getToken devuelve el token nuevo
      expect(getToken()).toBe("token-nuevo");
    });

    it("getToken devuelve null si no hay sesión guardada", () => {
      // Arrange: localStorage vacío (lo limpia el beforeEach)

      // Act + Assert: getToken devuelve null
      expect(getToken()).toBeNull();
    });
  });

  describe("clearToken", () => {
    it("clearToken borra el token y getToken pasa a devolver null", () => {
      // Arrange: ya hay un token guardado
      setToken("token-123");

      // Act: borrar el token con clearToken
      clearToken();

      // Assert: getToken devuelve null
      expect(getToken()).toBeNull();
    });

    it("clearToken no falla si no había token guardado", () => {
      // Arrange: localStorage vacío (lo limpia el beforeEach)

      // Act + Assert: clearToken no lanza error
      expect(() => clearToken()).not.toThrow();

      // Assert: getToken sigue devolviendo null
      expect(getToken()).toBeNull();
    });
  });
});
