const LayerRecipe = ({ layerRecipe, onUpdateLayerWeight }) => {
  if (layerRecipe.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 border border-secondary-100">
      <h2 className="text-2xl font-semibold text-secondary-800 mb-6">
        Layer Recipe
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {layerRecipe.map((layer, index) => (
          <div
            key={index}
            className="bg-secondary-50 rounded-lg p-4 border border-secondary-200"
          >
            <div className="text-sm font-medium text-secondary-700 mb-2">
              Layer {index}
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={layer[0]?.[2] || 0.5}
                onChange={(e) =>
                  onUpdateLayerWeight(index, parseFloat(e.target.value))
                }
                className="w-full accent-primary-600"
              />
              <div className="flex justify-between text-xs text-secondary-600">
                <span>Model 1</span>
                <span className="font-medium">
                  {(layer[0]?.[2] || 0.5).toFixed(2)}
                </span>
                <span>Model 2</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerRecipe;
