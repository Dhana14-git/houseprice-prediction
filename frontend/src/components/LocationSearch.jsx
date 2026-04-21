import { useState } from "react";

export default function LocationSearch({ setLocation, setAddress }) {
  const [query, setQuery] = useState("");

  const searchLocation = async () => {
    if (!query.trim()) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&accept-language=en`
    );
    const data = await res.json();

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      setLocation({ lat, lng });
      setAddress(data[0].display_name);
    } else {
      setAddress("Location not found");
    }
  };

  return (
    <div className="absolute top-6 left-6 z-30 w-96">
      <div className="flex gap-2 bg-[#0b1220] border border-[#1f2937] rounded-xl p-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search district, locality, landmark..."
          className="flex-1 bg-transparent text-white text-sm outline-none px-2"
        />
        <button
          onClick={searchLocation}
          className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium"
        >
          Search
        </button>
      </div>
    </div>
  );
}
