import { useCallback } from "react";

const API_BASE = "https://tcmmichaelb139-evolutiontransformer.hf.space";

export const useAPI = () => {
  const checkTaskStatus = useCallback(
    async (taskId, successCallback, errorCallback) => {
      try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          const error = `HTTP ${response.status}: ${response.statusText}`;
          console.error("Task check failed:", error);
          if (errorCallback) errorCallback(error);
          return;
        }

        const data = await response.json();
        console.log("Task status:", data.status);

        if (data.status === "SUCCESS") {
          successCallback(data.result);
        } else if (data.status === "PENDING") {
          setTimeout(
            () => checkTaskStatus(taskId, successCallback, errorCallback),
            1000
          );
        } else if (data.status === "FAILURE") {
          const error = data.result || "Task failed";
          console.error("Task failed:", error);
          if (errorCallback) errorCallback(error);
        }
      } catch (error) {
        console.error("Task check error:", error);
        if (errorCallback) errorCallback(error.message);
      }
    },
    []
  );

  const fetchModels = useCallback(async () => {
    try {
      console.log("Fetching models...");
      const response = await fetch(`${API_BASE}/list_models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();
      console.log("Fetch models response:", data);
      return data.task_id;
    } catch (error) {
      console.error("Fetch models error:", error);
      throw error;
    }
  }, []);

  const mergeModels = useCallback(async (mergeData) => {
    try {
      console.log("Merging models with data:", mergeData);
      const response = await fetch(`${API_BASE}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergeData),
        credentials: "include",
      });

      const data = await response.json();
      console.log("Merge response:", data);
      return data.task_id;
    } catch (error) {
      console.error("Merge error:", error);
      throw error;
    }
  }, []);

  const inference = useCallback(async (inferenceData) => {
    try {
      console.log("Running inference with data:", inferenceData);
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inferenceData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = `HTTP ${response.status}: ${response.statusText}`;
        console.error("Inference failed:", error);
        throw new Error(error);
      }

      const data = await response.json();
      console.log("Inference response:", data);
      return data;
    } catch (error) {
      console.error("Inference error:", error);
      throw error;
    }
  }, []);

  return {
    checkTaskStatus,
    fetchModels,
    mergeModels,
    inference,
  };
};
