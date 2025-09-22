export const getModelLayers = (modelKey) => {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${modelKey}_layers=`))
    ?.split("=")[1];

  return cookieValue ? parseInt(cookieValue) : null;
};

export const setModelLayers = (modelKey, numLayers) => {
  document.cookie = `${modelKey}_layers=${numLayers}`;
};

/**
 * Get layer counts using actual model names as keys
 * Returns "N/A" if no model is selected, otherwise returns stored count or default
 */
export const getModelLayerCounts = (selectedModel1, selectedModel2) => {
  const model1Layers = selectedModel1 ? getModelLayers(selectedModel1) : null;
  const model2Layers = selectedModel2 ? getModelLayers(selectedModel2) : null;

  return {
    model1: !selectedModel1 ? "N/A" : model1Layers !== null ? model1Layers : 12,
    model2: !selectedModel2 ? "N/A" : model2Layers !== null ? model2Layers : 12,
  };
};

/**
 * Set layer count for a model using its actual name as the key
 */
export const setModelLayersByName = (modelName, numLayers) => {
  if (modelName) {
    setModelLayers(modelName, numLayers);
  }
};

/**
 * Initialize default layer counts using actual model names as keys
 */
export const initializeDefaultCookies = (selectedModel1, selectedModel2) => {
  if (selectedModel1 && getModelLayers(selectedModel1) === null) {
    setModelLayers(selectedModel1, 24);
  }
  if (selectedModel2 && getModelLayers(selectedModel2) === null) {
    setModelLayers(selectedModel2, 36);
  }
};
