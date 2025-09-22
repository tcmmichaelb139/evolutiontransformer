import { useCallback } from "react";
import { devLog, devError } from "../utils/devLogger";

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
          devError("Task check failed:", error);
          if (errorCallback) errorCallback(error);
          return;
        }

        const data = await response.json();
        devLog("Task status:", data.status);

        if (data.status === "SUCCESS") {
          successCallback(data.result);
        } else if (data.status === "PENDING") {
          setTimeout(
            () => checkTaskStatus(taskId, successCallback, errorCallback),
            1000
          );
        } else if (data.status === "FAILURE") {
          const error = data.result || "Task failed";
          devError("Task failed:", error);
          if (errorCallback) errorCallback(error);
        }
      } catch (error) {
        devError("Task check error:", error);
        if (errorCallback) errorCallback(error.message);
      }
    },
    []
  );

  const fetchModels = useCallback(async () => {
    try {
      devLog("Fetching models...");
      const response = await fetch(`${API_BASE}/list_models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = `HTTP ${response.status}: ${response.statusText}`;
        devError("Fetch models failed:", error);
        throw new Error(error);
      }

      const data = await response.json();
      devLog("Fetch models response:", data);
      return data.task_id;
    } catch (error) {
      devError("Fetch models error:", error);
      throw error;
    }
  }, []);

  const mergeModels = useCallback(async (mergeData) => {
    try {
      devLog("Merging models with data:", mergeData);
      const response = await fetch(`${API_BASE}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergeData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = `HTTP ${response.status}: ${response.statusText}`;
        devError("Merge failed:", error);
        throw new Error(error);
      }

      const data = await response.json();
      devLog("Merge response:", data);
      return data.task_id;
    } catch (error) {
      devError("Merge error:", error);
      throw error;
    }
  }, []);

  const inference = useCallback(async (inferenceData) => {
    try {
      devLog("Running inference with data:", inferenceData);
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inferenceData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = `HTTP ${response.status}: ${response.statusText}`;
        devError("Inference failed:", error);
        throw new Error(error);
      }

      const data = await response.json();
      devLog("Inference response:", data);
      return data;
    } catch (error) {
      devError("Inference error:", error);
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
