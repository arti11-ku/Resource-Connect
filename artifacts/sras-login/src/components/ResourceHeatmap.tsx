import { useState, useCallback } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { RefreshCw, Info, TrendingDown, TrendingUp, Minus, Filter } from "lucide-react";

// ─── Data types (swap fetchResourceData() for a real API call when ready) ────

export interface ResourcePoint {
  id: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  demand: number;
  supply: number;
  category: "Food" | "Medical" | "Education" | "Water" | "Shelter";
  lastUpdated: string;
}

type Category = "All" | ResourcePoint["category"];

// ─── Mock data (replace with: const data = await apiFetch<ResourcePoint[]>("/resources/heatmap")) ─

const MOCK_DATA: ResourcePoint[] = [
  { id: "1",  city: "Mumbai",       state: "Maharashtra",    lat: 19.0760, lng: 72.8777, demand: 90, supply: 30, category: "Food",      lastUpdated: "2 min ago" },
  { id: "2",  city: "Delhi",        state: "Delhi",          lat: 28.6139, lng: 77.2090, demand: 85, supply: 40, category: "Medical",   lastUpdated: "5 min ago" },
  { id: "3",  city: "Kolkata",      state: "West Bengal",    lat: 22.5726, lng: 88.3639, demand: 70, supply: 60, category: "Food",      lastUpdated: "1 min ago" },
  { id: "4",  city: "Chennai",      state: "Tamil Nadu",     lat: 13.0827, lng: 80.2707, demand: 50, supply: 80, category: "Water",     lastUpdated: "3 min ago" },
  { id: "5",  city: "Bengaluru",    state: "Karnataka",      lat: 12.9716, lng: 77.5946, demand: 40, supply: 90, category: "Education", lastUpdated: "7 min ago" },
  { id: "6",  city: "Hyderabad",    state: "Telangana",      lat: 17.3850, lng: 78.4867, demand: 75, supply: 45, category: "Medical",   lastUpdated: "4 min ago" },
  { id: "7",  city: "Ahmedabad",    state: "Gujarat",        lat: 23.0225, lng: 72.5714, demand: 60, supply: 65, category: "Shelter",   lastUpdated: "6 min ago" },
  { id: "8",  city: "Pune",         state: "Maharashtra",    lat: 18.5204, lng: 73.8567, demand: 55, supply: 70, category: "Food",      lastUpdated: "8 min ago" },
  { id: "9",  city: "Jaipur",       state: "Rajasthan",      lat: 26.9124, lng: 75.7873, demand: 88, supply: 20, category: "Water",     lastUpdated: "2 min ago" },
  { id: "10", city: "Lucknow",      state: "Uttar Pradesh",  lat: 26.8467, lng: 80.9462, demand: 92, supply: 25, category: "Food",      lastUpdated: "3 min ago" },
  { id: "11", city: "Kanpur",       state: "Uttar Pradesh",  lat: 26.4499, lng: 80.3319, demand: 80, supply: 30, category: "Medical",   lastUpdated: "9 min ago" },
  { id: "12", city: "Nagpur",       state: "Maharashtra",    lat: 21.1458, lng: 79.0882, demand: 45, supply: 75, category: "Education", lastUpdated: "5 min ago" },
  { id: "13", city: "Patna",        state: "Bihar",          lat: 25.5941, lng: 85.1376, demand: 95, supply: 15, category: "Food",      lastUpdated: "1 min ago" },
  { id: "14", city: "Indore",       state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577, demand: 50, supply: 55, category: "Shelter",   lastUpdated: "4 min ago" },
  { id: "15", city: "Bhopal",       state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, demand: 65, supply: 50, category: "Medical",   lastUpdated: "6 min ago" },
  { id: "16", city: "Visakhapatnam",state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185, demand: 40, supply: 80, category: "Water",     lastUpdated: "7 min ago" },
  { id: "17", city: "Surat",        state: "Gujarat",        lat: 21.1702, lng: 72.8311, demand: 55, supply: 60, category: "Shelter",   lastUpdated: "8 min ago" },
  { id: "18", city: "Kochi",        state: "Kerala",         lat: 9.9312,  lng: 76.2673, demand: 30, supply: 85, category: "Food",      lastUpdated: "3 min ago" },
  { id: "19", city: "Guwahati",     state: "Assam",          lat: 26.1445, lng: 91.7362, demand: 78, supply: 35, category: "Medical",   lastUpdated: "5 min ago" },
  { id: "20", city: "Chandigarh",   state: "Punjab",         lat: 30.7333, lng: 76.7794, demand: 35, supply: 75, category: "Education", lastUpdated: "2 min ago" },
  { id: "21", city: "Varanasi",     state: "Uttar Pradesh",  lat: 25.3176, lng: 82.9739, demand: 88, supply: 22, category: "Food",      lastUpdated: "6 min ago" },
  { id: "22", city: "Bhubaneswar",  state: "Odisha",         lat: 20.2961, lng: 85.8245, demand: 60, supply: 55, category: "Shelter",   lastUpdated: "9 min ago" },
  { id: "23", city: "Coimbatore",   state: "Tamil Nadu",     lat: 11.0168, lng: 76.9558, demand: 42, supply: 78, category: "Water",     lastUpdated: "4 min ago" },
  { id: "24", city: "Madurai",      state: "Tamil Nadu",     lat: 9.9252,  lng: 78.1198, demand: 70, supply: 40, category: "Medical",   lastUpdated: "7 min ago" },
  { id: "25", city: "Ranchi",       state: "Jharkhand",      lat: 23.3441, lng: 85.3096, demand: 82, supply: 28, category: "Food",      lastUpdated: "1 min ago" },
  { id: "26", city: "Thiruvananthapuram", state: "Kerala",   lat: 8.5241,  lng: 76.9366, demand: 28, supply: 88, category: "Education", lastUpdated: "3 min ago" },
  { id: "27", city: "Amritsar",     state: "Punjab",         lat: 31.6340, lng: 74.8723, demand: 45, supply: 70, category: "Food",      lastUpdated: "5 min ago" },
  { id: "28", city: "Dehradun",     state: "Uttarakhand",    lat: 30.3165, lng: 78.0322, demand: 50, supply: 60, category: "Shelter",   lastUpdated: "6 min ago" },
  { id: "29", city: "Jodhpur",      state: "Rajasthan",      lat: 26.2389, lng: 73.0243, demand: 90, supply: 18, category: "Water",     lastUpdated: "2 min ago" },
  { id: "30", city: "Agra",         state: "Uttar Pradesh",  lat: 27.1767, lng: 78.0081, demand: 76, supply: 38, category: "Food",      lastUpdated: "8 min ago" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRatio(p: ResourcePoint) {
  if (p.demand === 0) return 2;
  return p.supply / p.demand;
}

function getColor(ratio: number): string {
  if (ratio < 0.4)  return "#ef4444"; // critical shortage — red
  if (ratio < 0.65) return "#f97316"; // moderate shortage — orange
  if (ratio < 0.85) return "#eab308"; // slight shortage — yellow
  if (ratio < 1.15) return "#84cc16"; // balanced — light green
  return "#22c55e";                    // surplus — green
}

function getStatus(ratio: number): { label: string; color: string; icon: React.ReactNode } {
  if (ratio < 0.4)  return { label: "Critical Shortage", color: "text-red-600",    icon: <TrendingDown size={13} /> };
  if (ratio < 0.65) return { label: "Moderate Shortage", color: "text-orange-600", icon: <TrendingDown size={13} /> };
  if (ratio < 0.85) return { label: "Slight Shortage",   color: "text-yellow-600", icon: <Minus size={13} /> };
  if (ratio < 1.15) return { label: "Balanced",          color: "text-lime-600",   icon: <Minus size={13} /> };
  return                   { label: "Surplus",            color: "text-green-600",  icon: <TrendingUp size={13} /> };
}

const CATEGORIES: Category[] = ["All", "Food", "Medical", "Water", "Education", "Shelter"];
const CATEGORY_EMOJIS: Record<string, string> = {
  Food: "🍱", Medical: "🏥", Water: "💧", Education: "📚", Shelter: "🏠",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface ResourceHeatmapProps {
  role?: "volunteer" | "admin" | "ngo";
}

export default function ResourceHeatmap({ role = "volunteer" }: ResourceHeatmapProps) {
  const [data, setData] = useState<ResourcePoint[]>(MOCK_DATA);
  const [filter, setFilter] = useState<Category>("All");
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("just now");

  const filteredData = filter === "All" ? data : data.filter(p => p.category === filter);

  const criticalCount  = data.filter(p => getRatio(p) < 0.4).length;
  const shortageCount  = data.filter(p => getRatio(p) >= 0.4 && getRatio(p) < 0.85).length;
  const surplusCount   = data.filter(p => getRatio(p) >= 1.15).length;

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    // TODO: Replace this simulated refresh with real DB fetch:
    // const fresh = await apiFetch<ResourcePoint[]>("/resources/heatmap");
    // setData(fresh);
    await new Promise(r => setTimeout(r, 900));
    setData([...MOCK_DATA]);
    setLastRefreshed("just now");
    setLoading(false);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* ─ Header strip ─ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Resource Demand vs Supply Map</h2>
          <p className="text-xs text-gray-400 mt-0.5">India · {data.length} locations · last refreshed {lastRefreshed}</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 transition-all shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* ─ Summary pills ─ */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100">
          <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
          <span className="text-xs font-bold text-red-700">{criticalCount} Critical Shortage</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-100">
          <span className="w-3 h-3 rounded-full bg-orange-400 shrink-0" />
          <span className="text-xs font-bold text-orange-700">{shortageCount} Moderate Shortage</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border border-green-100">
          <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
          <span className="text-xs font-bold text-green-700">{surplusCount} Surplus / Balanced</span>
        </div>
      </div>

      {/* ─ Category filter ─ */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-gray-400 shrink-0" />
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filter === cat
                ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
            }`}
          >
            {cat !== "All" && <span>{CATEGORY_EMOJIS[cat]}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* ─ Map ─ */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ minHeight: 400 }}>
        <MapContainer
          center={[22.5, 82.0]}
          zoom={5}
          scrollWheelZoom
          zoomControl={false}
          style={{ width: "100%", height: "100%", minHeight: 400 }}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredData.map(point => {
            const ratio = getRatio(point);
            const color = getColor(ratio);
            const status = getStatus(ratio);
            const radius = 8 + (point.demand / 100) * 14;
            return (
              <CircleMarker
                key={point.id}
                center={[point.lat, point.lng]}
                radius={radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.8,
                  color: "#fff",
                  weight: 1.5,
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[180px]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-gray-800 text-sm leading-tight">{point.city}</p>
                        <p className="text-xs text-gray-400">{point.state}</p>
                      </div>
                      <span className="text-lg">{CATEGORY_EMOJIS[point.category]}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold mb-3 ${status.color}`}>
                      {status.icon} {status.label}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                          <span>Demand</span><span className="font-semibold text-red-600">{point.demand}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-400 rounded-full" style={{ width: `${point.demand}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                          <span>Supply</span><span className="font-semibold text-green-600">{point.supply}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 rounded-full" style={{ width: `${point.supply}%` }} />
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                      <Info size={9} /> Updated {point.lastUpdated}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* ─ Legend ─ */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 pb-1">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Legend</span>
        {[
          { color: "#ef4444", label: "Critical Shortage  (supply < 40% demand)" },
          { color: "#f97316", label: "Moderate Shortage  (40–65%)" },
          { color: "#eab308", label: "Slight Shortage  (65–85%)" },
          { color: "#84cc16", label: "Balanced  (85–115%)" },
          { color: "#22c55e", label: "Surplus  (> 115%)" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
        <span className="text-xs text-gray-400 ml-auto">Circle size = demand intensity</span>
      </div>

      {role === "admin" && (
        <p className="text-xs text-gray-400 flex items-center gap-1.5 -mt-1">
          <Info size={11} />
          To connect live data: replace <code className="bg-gray-100 px-1 rounded">MOCK_DATA</code> in <code className="bg-gray-100 px-1 rounded">ResourceHeatmap.tsx</code> with an API call to <code className="bg-gray-100 px-1 rounded">/api/resources/heatmap</code>
        </p>
      )}
    </div>
  );
}
