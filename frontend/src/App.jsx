import { useState, useEffect } from "react";
import "./App.css";
import Options from "./components/Options";
import Recipe from "./components/Recipe";
import { setModelLayers } from "./utils/modelCookies";

function App() {
  const [models, setModels] = useState([]);
  const [selectedModel1, setSelectedModel1] = useState("");
  const [selectedModel2, setSelectedModel2] = useState("");
  const [layerRecipe, setLayerRecipe] = useState([]);
  const [embeddingLambdas, setEmbeddingLambdas] = useState([0.5, 0.5]);
  const [linearLambdas, setLinearLambdas] = useState([0.5, 0.5]);
  const [mergedName, setMergedName] = useState("merged");
  const [numLayers, setNumLayers] = useState(12);

  useEffect(() => {
    setModels(["svamp", "tinystories"]);
    setModelLayers("svamp", 24);
    setModelLayers("tinystories", 24);
  }, []);

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
