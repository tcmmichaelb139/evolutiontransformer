const ModelSelection = ({
  models,
  selectedModel1,
  setSelectedModel1,
  selectedModel2,
  setSelectedModel2,
  numLayers,
  setNumLayers,
  mergedName,
  setMergedName,
  onInitializeRecipe,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-secondary-100">
      <h2 className="text-2xl font-semibold text-secondary-800 mb-6">
        Model Selection
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Base Model (Model 1)
          </label>
          <select
            value={selectedModel1}
            onChange={(e) => setSelectedModel1(e.target.value)}
            className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select a model</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Target Model (Model 2)
          </label>
          <select
            value={selectedModel2}
            onChange={(e) => setSelectedModel2(e.target.value)}
            className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select a model</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Number of Layers
          </label>
          <input
            type="number"
            value={numLayers}
            onChange={(e) => setNumLayers(parseInt(e.target.value))}
            className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            min="1"
            max="48"
          />
          <button
            onClick={onInitializeRecipe}
            className="mt-2 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
          >
            Initialize Recipe
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Merged Model Name
          </label>
          <input
            type="text"
            value={mergedName}
            onChange={(e) => setMergedName(e.target.value)}
            className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter merged model name"
          />
        </div>
      </div>
    </div>
  );
};

export default ModelSelection;
