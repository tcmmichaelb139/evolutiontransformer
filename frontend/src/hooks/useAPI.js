import { useCallback } from "react";

const API_BASE = "https://tcmmichaelb139-evolutiontransformer.hf.space";

export const useAPI = () => {
  const checkTaskStatus = useCallback(async (taskId, callback) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`);
      const data = await response.json();

      if (data.status === "SUCCESS") {
        callback(data.result);
      } else if (data.status === "PENDING") {
        setTimeout(() => checkTaskStatus(taskId, callback), 1000);
      }
    } catch (error) {
      console.error("Task check failed:", error);
    }
  }, []);

  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/list_models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      return data.task_id;
    } catch (error) {
      console.error("Failed to fetch models:", error);
      return null;
    }
  }, []);

  const mergeModels = useCallback(async (mergeData) => {
    try {
      const response = await fetch(`${API_BASE}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergeData),
      });
      const data = await response.json();
      return data.task_id;
    } catch (error) {
      console.error("Merge failed:", error);
      return null;
    }
  }, []);

  const inference = useCallback(async (inferenceData) => {
    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inferenceData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Inference failed:", error);
      return null;
    }
  }, []);

  return {
    checkTaskStatus,
    fetchModels,
    mergeModels,
    inference,
  };
};
