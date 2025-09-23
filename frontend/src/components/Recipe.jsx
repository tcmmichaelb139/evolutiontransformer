import { useState, useEffect, useCallback } from "react";
import Dropdown from "./Dropdown";
import NumberInput from "./NumberInput";
import {
  getModelLayerCounts,
  initializeDefaultCookies,
} from "../utils/modelCookies";

const Recipe = ({
  layerRecipe,
  setLayerRecipe,
  embeddingLambdas,
  setEmbeddingLambdas,
  linearLambdas,
  setLinearLambdas,
  numLayers,
  selectedModel1,
  selectedModel2,
}) => {
  const [modelLayerCounts, setModelLayerCounts] = useState({
    model1: 12,
    model2: 12,
  });
  const [expandedBlock, setExpandedBlock] = useState(null);

  useEffect(() => {
    initializeDefaultCookies(selectedModel1, selectedModel2);
    const counts = getModelLayerCounts(selectedModel1, selectedModel2);
    setModelLayerCounts(counts);
  }, [selectedModel1, selectedModel2]);

  const initializeLayerRecipe = useCallback(() => {
    const recipe = [];
    for (let i = 0; i < numLayers; i++) {
      recipe.push([[1, 0, 0.5]]);
    }
    setLayerRecipe(recipe);
  }, [numLayers, setLayerRecipe]);

  useEffect(() => {
    if (layerRecipe.length !== numLayers) {
      initializeLayerRecipe();
    }
  }, [numLayers, layerRecipe.length, initializeLayerRecipe]);

  const addBlockToLayer = (layerIndex) => {
    const newRecipe = [...layerRecipe];
    const newBlock = [1, 1, 0.5];
    newRecipe[layerIndex] = [...newRecipe[layerIndex], newBlock];
    setLayerRecipe(newRecipe);
  };

  const removeBlockFromLayer = (layerIndex, blockIndex) => {
    const newRecipe = [...layerRecipe];
    if (newRecipe[layerIndex].length > 1) {
      newRecipe[layerIndex] = newRecipe[layerIndex].filter(
        (_, i) => i !== blockIndex
      );
      setLayerRecipe(newRecipe);
    }
  };

  const updateBlock = (layerIndex, blockIndex, field, value) => {
    const newRecipe = [...layerRecipe];
    const block = [...newRecipe[layerIndex][blockIndex]];

    if (field === "model") {
      block[1] = value;
      block[0] = 1;
    } else if (field === "sourceLayer") {
      block[0] = value;
    } else if (field === "percentage") {
      block[2] = value / 100;
    }

    newRecipe[layerIndex][blockIndex] = block;
    setLayerRecipe(newRecipe);
  };

  const updateEmbeddingLambda = (index, value) => {
    const newLambdas = [...embeddingLambdas];
    newLambdas[index] = value / 100;
    setEmbeddingLambdas(newLambdas);
  };

  const updateLinearLambda = (index, value) => {
    const newLambdas = [...linearLambdas];
    newLambdas[index] = value / 100;
    setLinearLambdas(newLambdas);
  };

  const modelOptions = [
    { value: 0, label: "Model 1" },
    { value: 1, label: "Model 2" },
  ];

  const getModelName = (modelValue) => {
    return modelValue === 0 ? "Model 1" : "Model 2";
  };

  const getBlockId = (layerIndex, blockIndex) => {
    return `${layerIndex}-${blockIndex}`;
  };

  const toggleBlockExpanded = (layerIndex, blockIndex) => {
    const blockId = getBlockId(layerIndex, blockIndex);
    setExpandedBlock(expandedBlock === blockId ? null : blockId);
  };

  return (
    <div className="p-6 border-2 border-primary-200 rounded-2xl bg-background shadow-xl fixed top-4 right-4 bottom-4 left-[27rem] overflow-y-auto ">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-primary-500 rounded-lg flex items-center justify-center">
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
            className="text-background"
          >
            <path d="M12 3v18m9-9H3" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground">Layer Recipe</h2>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Embedding Layers
            </h3>
            <div className="space-y-3">
              <NumberInput
                label="Token Embedding (%)"
                value={Math.round(embeddingLambdas[0] * 100)}
                onChange={(value) => updateEmbeddingLambda(0, value)}
                min={0}
                max={100}
              />
              <NumberInput
                label="Positional Embedding (%)"
                value={Math.round(embeddingLambdas[1] * 100)}
                onChange={(value) => updateEmbeddingLambda(1, value)}
                min={0}
                max={100}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Linear Layers
            </h3>
            <div className="space-y-3">
              <NumberInput
                label="LM Head (%)"
                value={Math.round(linearLambdas[0] * 100)}
                onChange={(value) => updateLinearLambda(0, value)}
                min={0}
                max={100}
              />
              <NumberInput
                label="LM Final (%)"
                value={Math.round(linearLambdas[1] * 100)}
                onChange={(value) => updateLinearLambda(1, value)}
                min={0}
                max={100}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Transformer Layers
            </h3>
            <div className="text-xs text-foreground space-x-4">
              <span>
                Model 1:{" "}
                {modelLayerCounts.model1 === "N/A"
                  ? "N/A layers"
                  : `${modelLayerCounts.model1} layers`}
              </span>
              <span>
                Model 2:{" "}
                {modelLayerCounts.model2 === "N/A"
                  ? "N/A layers"
                  : `${modelLayerCounts.model2} layers`}
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {layerRecipe.map((layer, layerIndex) => (
              <div
                key={layerIndex}
                className="relative border-2 border-secondary-200 rounded-xl p-4 bg-background hover:border-primary-300 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-foreground">
                      Layer {layerIndex + 1}
                    </h4>
                    <div className="text-xs text-foreground bg-secondary-100 px-2 py-1 rounded-md">
                      Total:{" "}
                      {Math.round(
                        layer.reduce((sum, block) => sum + block[2], 0) * 100
                      )}
                      %
                    </div>
                  </div>
                  <button
                    onClick={() => addBlockToLayer(layerIndex)}
                    className="w-6 h-6 bg-primary-500 text-background rounded-md hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center"
                    title="Add block"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14m7-7H5" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {layer.map((block, blockIndex) => {
                    const blockId = getBlockId(layerIndex, blockIndex);
                    const isExpanded = expandedBlock === blockId;
                    const modelName = getModelName(block[1]);

                    return (
                      <div key={blockIndex} className="relative">
                        <button
                          onClick={() =>
                            toggleBlockExpanded(layerIndex, blockIndex)
                          }
                          onContextMenu={(e) => {
                            e.preventDefault();
                            removeBlockFromLayer(layerIndex, blockIndex);
                          }}
                          className="px-3 py-2 bg-background border-2 border-secondary-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-sm font-medium text-foreground flex items-center space-x-2"
                          title="Left click to edit, Right click to delete"
                        >
                          <span className="text-primary-600">{modelName}</span>
                          <span className="text-foreground">L{block[0]}</span>
                          <span className="text-accent-600">
                            {Math.round(block[2] * 100)}%
                          </span>
                          <svg
                            className={`w-4 h-4 text-foreground transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {isExpanded && (
                          <div
                            className="absolute top-full left-0 mt-1 p-3 bg-background border-2 border-primary-200 rounded-lg shadow-lg z-10 min-w-64"
                            data-block-id={blockId}
                          >
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-foreground mb-1">
                                  Model
                                </label>
                                <Dropdown
                                  selectedValue={modelOptions.find(
                                    (opt) => opt.value === block[1]
                                  )}
                                  onSelect={(option) => {
                                    updateBlock(
                                      layerIndex,
                                      blockIndex,
                                      "model",
                                      option.value
                                    );
                                  }}
                                  options={modelOptions}
                                  placeholder="Select model..."
                                  className="w-full"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-foreground mb-1">
                                    Layer
                                  </label>
                                  <NumberInput
                                    value={block[0]}
                                    onChange={(value) =>
                                      updateBlock(
                                        layerIndex,
                                        blockIndex,
                                        "sourceLayer",
                                        value
                                      )
                                    }
                                    min={1}
                                    max={
                                      block[1] === 0
                                        ? modelLayerCounts.model1 === "N/A"
                                          ? 1
                                          : modelLayerCounts.model1
                                        : modelLayerCounts.model2 === "N/A"
                                        ? 1
                                        : modelLayerCounts.model2
                                    }
                                    compact={true}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-foreground mb-1">
                                    Weight (%)
                                  </label>
                                  <NumberInput
                                    value={Math.round(block[2] * 100)}
                                    onChange={(value) =>
                                      updateBlock(
                                        layerIndex,
                                        blockIndex,
                                        "percentage",
                                        value
                                      )
                                    }
                                    min={0}
                                    max={100}
                                    compact={true}
                                  />
                                </div>
                              </div>

                              {layer.length > 1 && (
                                <button
                                  onClick={() => {
                                    removeBlockFromLayer(
                                      layerIndex,
                                      blockIndex
                                    );
                                    setExpandedBlock(null);
                                  }}
                                  className="w-full px-3 py-2 bg-red-800 text-background rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                                >
                                  Remove Block
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recipe;
