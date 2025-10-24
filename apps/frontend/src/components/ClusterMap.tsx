import { useMemo, useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import type { CircleLayerSpecification, SymbolLayerSpecification } from "maplibre-gl";
import type { FeatureCollection, Point } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";

// --- Config for clusters: center, counts, and jitter (lon/lat ranges) ---
const CLUSTERS = [
    { region: "California",    count: 40, center: [-122.4, 37.7], jitter: [1.5, 1.0] },
    { region: "Massachusetts", count: 40, center: [ -71.0, 42.3], jitter: [1.0, 0.8] },
    { region: "Europe",        count: 50, center: [   2.3, 48.8], jitter: [15,   8 ] },
] as const;

// Small util to jitter a coordinate
const j = (range: number) => (Math.random() - 0.5) * range;

// Generate all points from config
function generatePoints(): FeatureCollection<Point> {
    let id = 0;
    return {
        type: "FeatureCollection",
        features: CLUSTERS.flatMap(({ region, count, center: [lon, lat], jitter: [jx, jy] }) =>
            Array.from({ length: count }, (_, i) => ({
                type: "Feature",
                properties: { id: id++, name: `${region} Point ${i}`, region },
                geometry: { type: "Point", coordinates: [lon + j(jx), lat + j(jy)] },
            }))
        ),
    };
}

// --- Layer styles ---
const clusterLayer: Omit<CircleLayerSpecification, "source"> = {
    id: "clusters",
    type: "circle",
    filter: ["has", "point_count"],
    paint: {
        "circle-color": ["step", ["get", "point_count"], "#51bbd6", 10, "#f1f075", 30, "#f28cb1"],
        "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 30, 40],
    },
};

const clusterCountLayer: Omit<SymbolLayerSpecification, "source"> = {
    id: "cluster-count",
    type: "symbol",
    filter: ["has", "point_count"],
    layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-size": 12,
    },
};

const unclusteredPointLayer: Omit<CircleLayerSpecification, "source"> = {
    id: "unclustered-point",
    type: "circle",
    filter: ["!", ["has", "point_count"]],
    paint: {
        "circle-color": "#11b4da",
        "circle-radius": 8,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
    },
};

function ClusterMap() {
    const [viewState, setViewState] = useState({
        longitude: -30,
        latitude: 45,
        zoom: 2.5,
    });

    const data = useMemo(generatePoints, []); // generate once

    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <Map
                {...viewState}
                onMove={(e) => setViewState(e.viewState)}
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                style={{ width: "100%", height: "100%" }}
            >
                <Source id="points" type="geojson" data={data} cluster clusterMaxZoom={14} clusterRadius={50}>
                    <Layer {...clusterLayer} />
                    <Layer {...clusterCountLayer} />
                    <Layer {...unclusteredPointLayer} />
                </Source>
            </Map>
        </div>
    );
}

export default ClusterMap;
