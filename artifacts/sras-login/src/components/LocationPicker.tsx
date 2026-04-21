import { useEffect, useRef, useState } from "react";
import L, { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Loader2 } from "lucide-react";

// Fix default marker icon paths (Leaflet's bundled icons break under Vite).
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface LocationValue {
  lat: number;
  lng: number;
  address: string;
}

interface Props {
  value?: LocationValue | null;
  onChange: (loc: LocationValue) => void;
  defaultCenter?: { lat: number; lng: number };
  className?: string;
}

interface SearchHit {
  display_name: string;
  lat: string;
  lon: string;
}

const ORANGE = "#FF7A00";

// Interactive map using Leaflet + OpenStreetMap. Click anywhere to drop a pin
// or search by place name (Nominatim). Both flows reverse-geocode the result
// into a human-readable address.
export default function LocationPicker({ value, onChange, defaultCenter, className }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const debounceRef = useRef<number | null>(null);

  // ── Init map once ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const start = value ?? defaultCenter ?? { lat: 19.076, lng: 72.8777 }; // Mumbai
    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: true })
      .setView([start.lat, start.lng], value ? 14 : 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    if (value) {
      markerRef.current = L.marker([value.lat, value.lng], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", () => {
        const ll = markerRef.current!.getLatLng();
        void selectAt(ll.lat, ll.lng);
      });
    }

    map.on("click", (e) => { void selectAt(e.latlng.lat, e.latlng.lng); });
    mapInstance.current = map;

    // Make sure the canvas sizes correctly inside the modal/card.
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.remove();
      mapInstance.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reverse geocode + update marker ───────────────────────────────────────
  async function selectAt(lat: number, lng: number) {
    const map = mapInstance.current;
    if (!map) return;
    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", () => {
        const ll = markerRef.current!.getLatLng();
        void selectAt(ll.lat, ll.lng);
      });
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
    map.panTo([lat, lng]);

    setResolving(true);
    let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { Accept: "application/json" } },
      );
      if (res.ok) {
        const data = (await res.json()) as { display_name?: string };
        if (data.display_name) address = data.display_name;
      }
    } catch {
      // keep coords-only fallback
    } finally {
      setResolving(false);
    }
    onChange({ lat, lng, address });
  }

  // ── Autocomplete search (debounced) ───────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (query.trim().length < 3) { setHits([]); return; }
    debounceRef.current = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query.trim())}`,
          { headers: { Accept: "application/json" } },
        );
        if (res.ok) {
          const data = (await res.json()) as SearchHit[];
          setHits(data);
        }
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  function pickHit(h: SearchHit) {
    const lat = parseFloat(h.lat);
    const lng = parseFloat(h.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    setQuery("");
    setHits([]);
    const map = mapInstance.current;
    if (map) map.setView([lat, lng], 15);
    onChange({ lat, lng, address: h.display_name });
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else if (map) {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", () => {
        const ll = markerRef.current!.getLatLng();
        void selectAt(ll.lat, ll.lng);
      });
    }
  }

  return (
    <div className={className}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search a place or click on the map…"
          className="w-full pl-8 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white"
        />
        {searching && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 animate-spin" />
        )}
        {hits.length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
            {hits.map((h, i) => (
              <button
                key={`${h.lat}-${h.lon}-${i}`}
                type="button"
                onClick={() => pickHit(h)}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-orange-50 border-b border-gray-50 last:border-0 flex items-start gap-2"
              >
                <MapPin size={12} className="text-orange-400 mt-0.5 shrink-0" />
                <span className="truncate">{h.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={mapRef}
        className="mt-2 w-full h-56 rounded-xl border border-gray-200 overflow-hidden"
        style={{ background: "#f1f5f9" }}
      />

      {value && (
        <div className="mt-2 flex items-start gap-2 p-2.5 rounded-xl bg-orange-50 border border-orange-100">
          <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: ORANGE }} />
          <div className="text-xs text-gray-700 flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{value.address}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
              {resolving && " · resolving address…"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
