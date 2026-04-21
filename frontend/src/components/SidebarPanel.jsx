import { useState } from "react";

const defaults = {
  construction_year: 2000,
  bedrooms: 2,
  living_rooms: 1,
  kitchens: 0,
  bathrooms: 1,
  school_count: 62,
  hospital_count: 17,
  retail_count: 32,
  restaurant_count: 85,
};

export default function SidebarPanel({ onChange }) {
  const [data, setData] = useState(defaults);

  const update = (e) => {
    const updated = { ...data, [e.target.name]: Number(e.target.value) };
    setData(updated);
    onChange(updated);
  };

  return (
    <aside className="w-80 bg-[#020617] border-r border-[#1f2937] p-4 overflow-y-auto">

      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
        Controls
      </h3>

      {/* HOUSE CARD */}
      <div className="bg-[#0b1220] border border-[#1f2937] rounded-2xl p-4 mb-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          🏠 House
        </h4>

        <div className="space-y-3">
          {["construction_year", "bedrooms", "living_rooms", "kitchens", "bathrooms"].map((k) => (
            <div key={k}>
              <label className="text-xs text-gray-400 uppercase">
                {k.replace("_", " ")}
              </label>
              <input
                name={k}
                type="number"
                value={data[k]}
                onChange={update}
                className="w-full mt-1 bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* AMENITIES CARD */}
      <div className="bg-[#0b1220] border border-[#1f2937] rounded-2xl p-4">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          📍 Amenities
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {["school_count", "hospital_count", "retail_count", "restaurant_count"].map((k) => (
            <div key={k}>
              <label className="text-xs text-gray-400 uppercase">
                {k.replace("_", " ")}
              </label>
              <input
                name={k}
                type="number"
                value={data[k]}
                onChange={update}
                className="w-full mt-1 bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
