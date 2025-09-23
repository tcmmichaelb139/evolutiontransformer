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

  const adjustLayerRecipe = useCallback(() => {
    const currentLength = layerRecipe.length;

    if (currentLength === numLayers) {
      return; // No change needed
    }

    let newRecipe = [...layerRecipe];

    if (currentLength < numLayers) {
      // Add new layers to the end
      for (let i = currentLength; i < numLayers; i++) {
        newRecipe.push([[1, 0, 1.0]]);
      }
    } else {
      // Remove layers from the end
      newRecipe = newRecipe.slice(0, numLayers);
    }

    setLayerRecipe(newRecipe);
  }, [numLayers, layerRecipe, setLayerRecipe]);

  const initializeLayerRecipe = useCallback(() => {
    const recipe = [];
    for (let i = 0; i < numLayers; i++) {
      recipe.push([[1, 0, 1.0]]);
    }
    setLayerRecipe(recipe);
  }, [numLayers, setLayerRecipe]);

  useEffect(() => {
    if (layerRecipe.length === 0) {
      // Initialize if recipe is empty
      initializeLayerRecipe();
    } else if (layerRecipe.length !== numLayers) {
      // Adjust existing recipe
      adjustLayerRecipe();
    }
  }, [numLayers, layerRecipe.length, initializeLayerRecipe, adjustLayerRecipe]);

  const addBlockToLayer = (layerIndex) => {
    const newRecipe = [...layerRecipe];
    const newBlock = [1, Math.random() < 0.5 ? 0 : 1, 0.5];
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
      // Ensure layer value is within valid range (1 to max layers for selected model)
      const selectedModel = block[1];
      const maxLayers =
        selectedModel === 0 ? modelLayerCounts.model1 : modelLayerCounts.model2;
      const maxLayerValue = maxLayers === "N/A" ? 1 : maxLayers;
      block[0] = Math.max(1, Math.min(maxLayerValue, value));
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

  const generateRandomRecipe = () => {
    const randomEmbedding1 = Math.random();
    const randomEmbedding2 = 1 - randomEmbedding1;
    setEmbeddingLambdas([randomEmbedding1, randomEmbedding2]);

    const randomLinear1 = Math.random();
    const randomLinear2 = 1 - randomLinear1;
    setLinearLambdas([randomLinear1, randomLinear2]);

    const newRecipe = [];
    for (let i = 0; i < numLayers; i++) {
      const numBlocks = Math.floor(Math.random() * 5) + 1;
      const layer = [];

      const weights = [];
      for (let j = 0; j < numBlocks; j++) {
        weights.push(Math.random());
      }

      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      const normalizedWeights = weights.map((w) => w / totalWeight);

      for (let j = 0; j < numBlocks; j++) {
        const randomModel = Math.floor(Math.random() * 2); // 0 or 1
        const maxLayers =
          randomModel === 0 ? modelLayerCounts.model1 : modelLayerCounts.model2;
        const maxLayerValue = maxLayers === "N/A" ? 1 : maxLayers;

        const randomLayer = Math.floor(Math.random() * maxLayerValue) + 1;
        layer.push([randomLayer, randomModel, normalizedWeights[j]]);
      }

      newRecipe.push(layer);
    }

    setLayerRecipe(newRecipe);
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
        <button
          onClick={generateRandomRecipe}
          className="ml-4 px-4 py-2 bg-gradient-to-r from-accent-500 to-primary-500 text-white font-medium rounded-lg hover:from-accent-600 hover:to-primary-600 transition-all duration-200 flex items-center space-x-2 text-sm"
        >
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
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          <span>Random Recipe</span>
        </button>
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
