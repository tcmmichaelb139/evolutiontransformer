import { useState } from "react";
import Dropdown from "./Dropdown";
import NumberInput from "./NumberInput";
import InferencePopup from "./InferencePopup";
import { setModelLayers } from "../utils/modelCookies";
import { useAPI } from "../hooks/useAPI";
import { devLog, devError } from "../utils/devLogger";

const Options = ({
  models,
  selectedModel1,
  selectedModel2,
  setSelectedModel1,
  setSelectedModel2,
  numLayers,
  setNumLayers,
  layerRecipe,
  embeddingLambdas,
  linearLambdas,
  setModels,
  mergedName,
  setMergedName,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mergeStatus, setMergeStatus] = useState("");
  const [isInferenceOpen, setIsInferenceOpen] = useState(false);
  const { mergeModels, checkTaskStatus } = useAPI();

  const handleMerge = async () => {
    if (
      !selectedModel1 ||
      !selectedModel2 ||
      layerRecipe.length === 0 ||
      !mergedName.trim()
    ) {
      setMergeStatus(
        "Error: Please select models, configure recipe, and provide a merged model name"
      );
      return;
    }

    setIsLoading(true);
    setMergeStatus("Merging models...");

    try {
      const mergeData = {
        model1_name: selectedModel1,
        model2_name: selectedModel2,
        layer_recipe: layerRecipe,
        embedding_lambdas: embeddingLambdas,
        linear_lambdas: linearLambdas,
        merged_name: mergedName,
      };

      devLog("Starting merge with data:", mergeData);
      const taskId = await mergeModels(mergeData);
      devLog("Got merge task ID:", taskId);

      if (taskId) {
        checkTaskStatus(
          taskId,
          (taskResult) => {
            devLog("Merge result:", taskResult);
            if (taskResult.response) {
              setMergeStatus("Merge successful!");
              const newModelName = taskResult.response || mergedName;
              setModels((prev) => [...prev, newModelName]);
              setModelLayers(newModelName, numLayers);
            } else {
              setMergeStatus(
                `Merge failed: ${taskResult.error || "Unknown error"}`
              );
            }
            setIsLoading(false);
          },
          (error) => {
            devError("Merge task failed:", error);
            setMergeStatus(`Merge failed: ${error}`);
            setIsLoading(false);
          }
        );
      }
    } catch (error) {
      devError("Merge error:", error);
      setMergeStatus(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="p-6 border-2 border-primary-200 rounded-2xl bg-background shadow-xl fixed inset-y-4 left-4 w-[25rem] overflow-y-auto">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-background">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 17H5" />
              <path d="M19 7h-9" />
              <circle cx="17" cy="17" r="3" />
              <circle cx="7" cy="7" r="3" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Evolution Transformer Options
          </h2>
        </div>

        <div className="space-y-6">
          <Dropdown
            label="Model 1"
            selectedValue={selectedModel1}
            onSelect={setSelectedModel1}
            options={models}
            placeholder="Select base model..."
            loading={models.length === 0}
            loadingMessage="Loading models..."
            emptyMessage="No models available"
            showSearch={true}
            searchPlaceholder="Search models..."
          />

          <Dropdown
            label="Model 2"
            selectedValue={selectedModel2}
            onSelect={setSelectedModel2}
            options={models}
            placeholder="Select target model..."
            loading={models.length === 0}
            loadingMessage="Loading models..."
            emptyMessage="No models available"
            showSearch={true}
            searchPlaceholder="Search models..."
          />

          <NumberInput
            label="Number of Layers"
            value={numLayers}
            onChange={setNumLayers}
            min={1}
            max={48}
            className="w-full"
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Merged Model Name
            </label>
            <input
              type="text"
              value={mergedName}
              onChange={(e) => setMergedName(e.target.value)}
              placeholder="Enter merged model name..."
              className="w-full px-3 py-2 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-foreground placeholder-secondary-400 transition-all duration-200"
            />
          </div>

          <div className="p-4 rounded-xl border-2 border-secondary-200 bg-secondary-50">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  selectedModel1 && selectedModel2
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span>
                Selected:{" "}
                {selectedModel1 && selectedModel2
                  ? "Ready to merge"
                  : "Incomplete"}
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <div className="flex-1 p-4 rounded-xl border-2 border-accent-200 bg-accent-50">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-accent-500 to-secondary-500 rounded-lg flex items-center justify-center text-background">
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
                    <path d="m8 6 4-4 4 4" />
                    <path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22" />
                    <path d="m20 22-5-5" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Merge Models
                </h3>
              </div>

              <button
                onClick={handleMerge}
                disabled={
                  isLoading ||
                  !selectedModel1 ||
                  !selectedModel2 ||
                  layerRecipe.length === 0 ||
                  !mergedName.trim()
                }
                className="w-full py-2.5 px-3 bg-gradient-to-r from-accent-500 to-primary-500 text-background font-medium rounded-lg hover:from-accent-600 hover:to-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full"></div>
                    <span>Merging...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m8 6 4-4 4 4" />
                      <path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22" />
                      <path d="m20 22-5-5" />
                    </svg>
                    <span>Merge</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 p-4 rounded-xl border-2 border-primary-200 bg-primary-50">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-lg flex items-center justify-center text-background">
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
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Test Inference
                </h3>
              </div>

              <button
                onClick={() => setIsInferenceOpen(true)}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-secondary-500 to-primary-500 text-background font-medium rounded-lg hover:from-secondary-600 hover:to-primary-600 transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Inference</span>
              </button>
            </div>
          </div>

          {mergeStatus && (
            <div
              className={`p-2 rounded-lg text-sm font-medium ${
                mergeStatus.includes("successful")
                  ? "bg-green-100 text-green-800"
                  : mergeStatus.includes("Error") ||
                    mergeStatus.includes("failed")
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {mergeStatus}
            </div>
          )}
        </div>
      </div>

      <InferencePopup
        isOpen={isInferenceOpen}
        onClose={() => setIsInferenceOpen(false)}
        models={models}
      />
    </div>
  );
};

export default Options;
