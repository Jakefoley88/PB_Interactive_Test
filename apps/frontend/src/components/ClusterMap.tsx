import { useState, useMemo } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import type { CircleLayerSpecification, SymbolLayerSpecification } from 'maplibre-gl';
import type { FeatureCollection, Feature, Point } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';

// Generate points in specific regions
const generatePoints = (): Feature<Point>[] => {
    const points: Feature<Point>[] = [];
    let id = 0;

    // California cluster (around San Francisco/Bay Area)
    for (let i = 0; i < 40; i++) {
        points.push({
            type: 'Feature',
            properties: {
                id: id++,
                name: `California Point ${i}`,
                region: 'California'
            },
            geometry: {
                type: 'Point',
                coordinates: [
                    -122.4 + (Math.random() - 0.5) * 1.5, // San Francisco area
                    37.7 + (Math.random() - 0.5) * 1.0
                ]
            }
        });
    }

    // Massachusetts cluster (around Boston)
    for (let i = 0; i < 40; i++) {
        points.push({
            type: 'Feature',
            properties: {
                id: id++,
                name: `Massachusetts Point ${i}`,
                region: 'Massachusetts'
            },
            geometry: {
                type: 'Point',
                coordinates: [
                    -71.0 + (Math.random() - 0.5) * 1.0, // Boston area
                    42.3 + (Math.random() - 0.5) * 0.8
                ]
            }
        });
    }

    // Europe cluster (around central Europe - France, Germany, UK)
    for (let i = 0; i < 50; i++) {
        points.push({
            type: 'Feature',
            properties: {
                id: id++,
                name: `Europe Point ${i}`,
                region: 'Europe'
            },
            geometry: {
                type: 'Point',
                coordinates: [
                    2.3 + (Math.random() - 0.5) * 15, // Spread across Western/Central Europe
                    48.8 + (Math.random() - 0.5) * 8
                ]
            }
        });
    }

    return points;
};

// Layer styles for clusters
const clusterLayer: Omit<CircleLayerSpecification, 'source'> = {
    id: 'clusters',
    type: 'circle',
    filter: ['has', 'point_count'],
    paint: {
        'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            10,
            '#f1f075',
            30,
            '#f28cb1'
        ],
        'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10,
            30,
            30,
            40
        ]
    }
};

const clusterCountLayer: Omit<SymbolLayerSpecification, 'source'> = {
    id: 'cluster-count',
    type: 'symbol',
    filter: ['has', 'point_count'],
    layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 12
    }
};

const unclusteredPointLayer: Omit<CircleLayerSpecification, 'source'> = {
    id: 'unclustered-point',
    type: 'circle',
    filter: ['!', ['has', 'point_count']],
    paint: {
        'circle-color': '#11b4da',
        'circle-radius': 8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
    }
};

function ClusterMap() {
    const [viewState, setViewState] = useState({
        longitude: -30, // Center between US and Europe
        latitude: 45,
        zoom: 2.5 // Zoom out to see both continents
    });

    const [selectedPoint, setSelectedPoint] = useState<any>(null);

    // Generate data only once using useMemo
    const geojsonData: FeatureCollection<Point> = useMemo(() => ({
        type: 'FeatureCollection',
        features: generatePoints()
    }), []); // Empty dependency array means this only runs once

    console.log('GeoJSON data:', geojsonData);
    console.log('Number of points:', geojsonData.features.length);

    // Handle clicks on the map
    const onClick = (event: any) => {
        const feature = event.features?.[0];
        if (feature) {
            console.log('Clicked feature:', feature);
            setSelectedPoint(feature.properties);
        }
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Map
                {...viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                onClick={onClick}
                interactiveLayerIds={['clusters', 'unclustered-point']}
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                style={{ width: '100%', height: '100%' }}
                cursor="pointer"
            >
                <Source
                    id="points"
                    type="geojson"
                    data={geojsonData}
                    cluster={true}
                    clusterMaxZoom={14}
                    clusterRadius={50}
                >
                    <Layer {...clusterLayer} />
                    <Layer {...clusterCountLayer} />
                    <Layer {...unclusteredPointLayer} />
                </Source>
            </Map>

            {/* Info box to show selected point */}
            {selectedPoint && (
                <div style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    background: 'white',
                    padding: '15px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 1,
                    maxWidth: '300px'
                }}>
                    <button
                        onClick={() => setSelectedPoint(null)}
                        style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '18px',
                            cursor: 'pointer',
                            padding: '5px'
                        }}
                    >
                        ×
                    </button>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Point Details</h3>
                    <p style={{ margin: '5px 0' }}><strong>Name:</strong> {selectedPoint.name}</p>
                    <p style={{ margin: '5px 0' }}><strong>Region:</strong> {selectedPoint.region}</p>
                    <p style={{ margin: '5px 0' }}><strong>ID:</strong> {selectedPoint.id}</p>
                    {selectedPoint.point_count && (
                        <p style={{ margin: '5px 0' }}>
                            <strong>Cluster:</strong> {selectedPoint.point_count} points
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default ClusterMap;