import { useState } from "react";
import Dropdown from "./Dropdown";
import NumberInput from "./NumberInput";
import { useAPI } from "../hooks/useAPI";
import { devLog, devError } from "../utils/devLogger";

const InferencePopup = ({ isOpen, onClose, models }) => {
  const [selectedModel, setSelectedModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [maxNewTokens, setMaxNewTokens] = useState(512);
  const [temperature, setTemperature] = useState(0.7);

  const { inference, checkTaskStatus } = useAPI();

  const handleInference = async () => {
    if (!selectedModel || !prompt.trim()) {
      setError("Please select a model and enter a prompt");
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse("");

    try {
      const inferenceData = {
        model_name: selectedModel,
        prompt: prompt,
        max_new_tokens: maxNewTokens,
        temperature: temperature,
      };

      devLog("Starting inference with data:", inferenceData);
      const result = await inference(inferenceData);
      devLog("Got inference result:", result);

      if (result && result.task_id) {
        checkTaskStatus(
          result.task_id,
          (taskResult) => {
            devLog("Inference task result:", taskResult);
            if (taskResult && taskResult.response) {
              setResponse(taskResult.response);
            } else if (taskResult && taskResult.error) {
              setError(`Inference failed: ${taskResult.error}`);
            } else {
              setError("No response received from the model");
            }
            setIsLoading(false);
          },
          (errorMessage) => {
            // Error callback for task status check
            devError("Inference task failed:", errorMessage);
            setError(`Task failed: ${errorMessage}`);
            setIsLoading(false);
          }
        );
      } else if (result && result.error) {
        // Check if it's a server error
        const isServerError = result.error.includes("HTTP 5");
        const errorPrefix = isServerError ? "🔴 Server Error: " : "Error: ";
        setError(`${errorPrefix}${result.error}`);
        setIsLoading(false);
      } else {
        setError("No task ID received");
        setIsLoading(false);
      }
    } catch (err) {
      devError("Inference error:", err);
      setError(`Error: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedModel("");
    setPrompt("");
    setResponse("");
    setError("");
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)", // Safari support
      }}
    >
      <div className="bg-background rounded-2xl border-2 border-primary-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-secondary-200 bg-secondary-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-background">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Model Inference
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg hover:bg-secondary-200 transition-colors duration-200 flex items-center justify-center text-foreground hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          <Dropdown
            label="Select Model"
            selectedValue={selectedModel}
            onSelect={setSelectedModel}
            options={models}
            placeholder="Choose a model for inference..."
            showSearch={true}
            searchPlaceholder="Search models..."
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full h-32 p-3 border-2 border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Configuration Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max New Tokens
              </label>
              <NumberInput
                value={maxNewTokens}
                onChange={setMaxNewTokens}
                min={1}
                max={1024}
                step={1}
                className=""
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Temperature
              </label>
              <NumberInput
                value={temperature}
                onChange={setTemperature}
                min={0.1}
                max={2.0}
                step={0.1}
                allowDecimals={true}
                className=""
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleInference}
            disabled={isLoading || !selectedModel || !prompt.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-accent-500 text-background font-medium rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-background border-t-transparent rounded-full"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Generate</span>
              </>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Generated Response
              </label>
              <div className="p-4 bg-primary-50 border-2 border-primary-200 rounded-xl">
                <p className="text-foreground backgroundspace-pre-wrap">
                  {response}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InferencePopup;
