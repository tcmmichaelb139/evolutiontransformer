import { useState, useEffect } from "react";
import "./App.css";
import Options from "./components/Options";
import Recipe from "./components/Recipe";
import { setModelLayers } from "./utils/modelCookies";
import { useAPI } from "./hooks/useAPI";

function App() {
  const [models, setModels] = useState([]);
  const [selectedModel1, setSelectedModel1] = useState("");
  const [selectedModel2, setSelectedModel2] = useState("");
  const [layerRecipe, setLayerRecipe] = useState([]);
  const [embeddingLambdas, setEmbeddingLambdas] = useState([0.5, 0.5]);
  const [linearLambdas, setLinearLambdas] = useState([0.5, 0.5]);
  const [mergedName, setMergedName] = useState("merged");
  const [numLayers, setNumLayers] = useState(12);

  const { fetchModels, checkTaskStatus } = useAPI();

  useEffect(() => {
    setModelLayers("svamp", 24);
    setModelLayers("tinystories", 24);

    const loadModels = async () => {
      try {
        const taskId = await fetchModels();

        if (taskId) {
          checkTaskStatus(
            taskId,
            (result) => {
              if (result && Array.isArray(result.response)) {
                setModels(result.response);
              }
            },
            (error) => {
              console.error("Failed to load models:", error);
            }
          );
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    loadModels();
  }, [fetchModels, checkTaskStatus]);

  return (
    <div className="h-screen bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
      <Options
        models={models}
        selectedModel1={selectedModel1}
        selectedModel2={selectedModel2}
        setSelectedModel1={setSelectedModel1}
        setSelectedModel2={setSelectedModel2}
        numLayers={numLayers}
        setNumLayers={setNumLayers}
        layerRecipe={layerRecipe}
        embeddingLambdas={embeddingLambdas}
        linearLambdas={linearLambdas}
        setModels={setModels}
        mergedName={mergedName}
        setMergedName={setMergedName}
      />
      <Recipe
        layerRecipe={layerRecipe}
        setLayerRecipe={setLayerRecipe}
        embeddingLambdas={embeddingLambdas}
        setEmbeddingLambdas={setEmbeddingLambdas}
        linearLambdas={linearLambdas}
        setLinearLambdas={setLinearLambdas}
        numLayers={numLayers}
        selectedModel1={selectedModel1}
        selectedModel2={selectedModel2}
      />
      <div className="max-w-6xl mx-auto"></div>
    </div>
  );
}

export default App;
