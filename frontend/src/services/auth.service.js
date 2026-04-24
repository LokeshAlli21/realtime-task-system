import env from "../env.js";

class AuthService {
  constructor() {
    this.baseUrl = env.backendUrl;
  }

  getAuthHeaders(skipContentType = false) {
    const token = localStorage.getItem("token");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!skipContentType) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  async login(data) {
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return await res.json();
    } catch (err) {
      console.error("Login Error:", err);
      throw err;
    }
  }

  async signup(data) {
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return await res.json();
    } catch (err) {
      console.error("Signup Error:", err);
      throw err;
    }
  }

  async getCurrentUser() {
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/me`, {
        method: "GET",
        headers: this.getAuthHeaders(true),
      });

      return await res.json();
    } catch (err) {
      console.error("Get Current User Error:", err);
      throw err;
    }
  }

  async getAllUsers() {
    try {
      const res = await fetch(`${this.baseUrl}/api/users`, {
        method: "GET",
        headers: this.getAuthHeaders(true),
      });

      return await res.json();
    } catch (err) {
      console.error("Get All Users Error:", err);
      throw err;
    }
  }

  async getUserById(userId) {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/users/${userId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(true),
        }
      );

      return await res.json();
    } catch (err) {
      console.error("Get User By ID Error:", err);
      throw err;
    }
  }

  logout() {
    localStorage.removeItem("token");
  }
}

const authService = new AuthService();
export default authService;