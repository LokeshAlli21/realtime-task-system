import { useState } from "react";
import axios from "axios";

const TestTask = () => {
  const [title, setTitle] = useState("");

  const handleCreateTask = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/tasks",
        {
          title,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Task API Response:", res.data);
      setTitle("");

    } catch (err) {
      console.error("❌ Error creating task:", err.response?.data || err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Create Task (Test)</h2>

      <input
        type="text"
        placeholder="Enter task title"
        className="border p-2 mr-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button
        onClick={handleCreateTask}
        className="bg-green-500 text-white px-4 py-2"
      >
        Create Task
      </button>
    </div>
  );
};

export default TestTask;