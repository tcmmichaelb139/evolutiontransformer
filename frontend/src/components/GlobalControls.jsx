const GlobalControls = ({
  embeddingLambdas,
  setEmbeddingLambdas,
  linearLambdas,
  setLinearLambdas,
  onMerge,
  isLoading,
  isDisabled,
  result,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-secondary-100">
      <h2 className="text-2xl font-semibold text-secondary-800 mb-6">
        Global Controls
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Embedding Weights
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-secondary-600">Model 1</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={embeddingLambdas[0]}
                onChange={(e) =>
                  setEmbeddingLambdas([
                    parseFloat(e.target.value),
                    1 - parseFloat(e.target.value),
                  ])
                }
                className="w-full"
              />
              <span className="text-sm text-secondary-600">
                {embeddingLambdas[0].toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-xs text-secondary-600">Model 2</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={embeddingLambdas[1]}
                onChange={(e) =>
                  setEmbeddingLambdas([
                    1 - parseFloat(e.target.value),
                    parseFloat(e.target.value),
                  ])
                }
                className="w-full"
              />
              <span className="text-sm text-secondary-600">
                {embeddingLambdas[1].toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Linear Weights
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-secondary-600">Model 1</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={linearLambdas[0]}
                onChange={(e) =>
                  setLinearLambdas([
                    parseFloat(e.target.value),
                    1 - parseFloat(e.target.value),
                  ])
                }
                className="w-full"
              />
              <span className="text-sm text-secondary-600">
                {linearLambdas[0].toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-xs text-secondary-600">Model 2</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={linearLambdas[1]}
                onChange={(e) =>
                  setLinearLambdas([
                    1 - parseFloat(e.target.value),
                    parseFloat(e.target.value),
                  ])
                }
                className="w-full"
              />
              <span className="text-sm text-secondary-600">
                {linearLambdas[1].toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onMerge}
          disabled={isDisabled}
          className="w-full py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Merging Models..." : "Merge Models"}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-accent-50 border border-accent-200 rounded-lg">
            <h3 className="font-medium text-accent-800 mb-2">
              Merge Complete!
            </h3>
            <p className="text-sm text-accent-700">{JSON.stringify(result)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalControls;
