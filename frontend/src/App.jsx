import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import ModelSelection from "./components/ModelSelection";
import GlobalControls from "./components/GlobalControls";
import LayerRecipe from "./components/LayerRecipe";
import { useAPI } from "./hooks/useAPI";

function App() {
  const [models, setModels] = useState([]);
  const [selectedModel1, setSelectedModel1] = useState("");
  const [selectedModel2, setSelectedModel2] = useState("");
  const [layerRecipe, setLayerRecipe] = useState([]);
  const [embeddingLambdas, setEmbeddingLambdas] = useState([0.5, 0.5]);
  const [linearLambdas, setLinearLambdas] = useState([0.5, 0.5]);
  const [mergedName, setMergedName] = useState("merged");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [numLayers, setNumLayers] = useState(12);

  const { checkTaskStatus, fetchModels, mergeModels } = useAPI();

  useEffect(() => {
    const loadModels = async () => {
      const taskId = await fetchModels();
      if (taskId) {
        setTimeout(
          () =>
            checkTaskStatus(taskId, (result) => {
              if (result && Array.isArray(result)) {
                setModels(result);
              }
            }),
          1000
        );
      }
    };

    loadModels();
  }, [fetchModels, checkTaskStatus]);

  const initializeLayerRecipe = () => {
    const recipe = [];
    for (let i = 0; i < numLayers; i++) {
      recipe.push([[i, i, 0.5]]);
    }
    setLayerRecipe(recipe);
  };

  const updateLayerWeight = (layerIndex, weight) => {
    const newRecipe = [...layerRecipe];
    if (!newRecipe[layerIndex]) {
      newRecipe[layerIndex] = [[layerIndex, layerIndex, weight]];
    } else {
      newRecipe[layerIndex][0][2] = weight;
    }
    setLayerRecipe(newRecipe);
  };

  const handleMerge = async () => {
    if (!selectedModel1 || !selectedModel2 || layerRecipe.length === 0) {
      alert("Please select both models and configure layer recipe");
      return;
    }

    setIsLoading(true);
    setResult(null);

    const mergeData = {
      model1_name: selectedModel1,
      model2_name: selectedModel2,
      layer_recipe: layerRecipe,
      embedding_lambdas: embeddingLambdas,
      linear_lambdas: linearLambdas,
      merged_name: mergedName,
    };

    const taskId = await mergeModels(mergeData);
    if (taskId) {
      checkTaskStatus(taskId, (result) => {
        setResult(result);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  };

  const isMergeDisabled =
    isLoading || !selectedModel1 || !selectedModel2 || layerRecipe.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Header />

        <div className="grid lg:grid-cols-2 gap-8">
          <ModelSelection
            models={models}
            selectedModel1={selectedModel1}
            setSelectedModel1={setSelectedModel1}
            selectedModel2={selectedModel2}
            setSelectedModel2={setSelectedModel2}
            numLayers={numLayers}
            setNumLayers={setNumLayers}
            mergedName={mergedName}
            setMergedName={setMergedName}
            onInitializeRecipe={initializeLayerRecipe}
          />

          <GlobalControls
            embeddingLambdas={embeddingLambdas}
            setEmbeddingLambdas={setEmbeddingLambdas}
            linearLambdas={linearLambdas}
            setLinearLambdas={setLinearLambdas}
            onMerge={handleMerge}
            isLoading={isLoading}
            isDisabled={isMergeDisabled}
            result={result}
          />
        </div>

        <LayerRecipe
          layerRecipe={layerRecipe}
          onUpdateLayerWeight={updateLayerWeight}
        />
      </div>
    </div>
  );
}

export default App;
