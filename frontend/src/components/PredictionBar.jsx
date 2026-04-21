export default function PredictionBar({ price, loading, onPredict }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#020617]/95 backdrop-blur-xl border border-[#1f2937] rounded-2xl px-8 py-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center gap-10">

      <div>
        <p className="text-xs text-gray-400 uppercase">Estimated Value</p>
        <p className="text-2xl font-bold mt-1">
          {price ? `₹ ${price}` : "—"}
        </p>
      </div>

      <button
        onClick={onPredict}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all text-white font-semibold px-10 py-3 rounded-xl shadow-lg"
      >
        {loading ? "Predicting…" : "Predict"}
      </button>
    </div>
  );
}
