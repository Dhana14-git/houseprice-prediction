export default function LocationOverlay({ location }) {
    if (!location) return null;
  
    return (
      <div className="absolute top-6 right-6 z-40 w-64 bg-[#0d131a]/90 border border-[#344865] rounded-xl p-4 shadow-xl">
        <h4 className="text-xs uppercase text-gray-400 mb-2">
          Selected Location
        </h4>
        <p className="text-sm font-mono">
          {location.lat}, {location.lng}
        </p>
        <p className="text-sm mt-2">{location.address}</p>
      </div>
    );
  }
  