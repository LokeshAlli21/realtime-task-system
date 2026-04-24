import env from "../env.js";

class TaskService {
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

  async createTask(data) {
    try {
      const res = await fetch(`${this.baseUrl}/api/tasks`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await res.json();
    } catch (err) {
      console.error("Create Task Error:", err);
      throw err;
    }
  }

  async getTasks() {
    try {
      const res = await fetch(`${this.baseUrl}/api/tasks`, {
        method: "GET",
        headers: this.getAuthHeaders(true),
      });

      return await res.json();
    } catch (err) {
      console.error("Get Tasks Error:", err);
      throw err;
    }
  }

  async updateTask(taskId, data) {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(data),
        }
      );

      return await res.json();
    } catch (err) {
      console.error("Update Task Error:", err);
      throw err;
    }
  }

  async deleteTask(taskId) {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(true),
        }
      );

      return await res.json();
    } catch (err) {
      console.error("Delete Task Error:", err);
      throw err;
    }
  }

  async getActivities() {
    try {
      const res = await fetch(`${this.baseUrl}/api/activities`, {
        method: "GET",
        headers: this.getAuthHeaders(true),
      });

      return await res.json();
    } catch (err) {
      console.error("Get Tasks Error:", err);
      throw err;
    }
  }
}

const taskService = new TaskService()
export default taskService