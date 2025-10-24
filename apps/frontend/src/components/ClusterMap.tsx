import React, { useState, useMemo, useRef } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import type { CircleLayerSpecification, SymbolLayerSpecification } from 'maplibre-gl';
import type { FeatureCollection, Feature, Point } from 'geojson';
import type { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import MAP_STYLE from '../../public/map-style-basic-v8.json';
import {fromJS} from 'immutable';
const defaultMapStyle: any = fromJS(MAP_STYLE);


// Generate points in specific regions
const generatePoints = (): Feature<Point>[] => {
    const points: Feature<Point>[] = [];
    let id = 0;

    // California cluster (around San Francisco/Bay Area)
    for (let i = 0; i < 40; i++) {
        points.push({
            type: 'Feature',
            id: id,  // Feature-level ID for feature-state
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
            id: id,  // Feature-level ID for feature-state
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
            id: id,  // Feature-level ID for feature-state
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
            '#d4b574',  // Light mustard for small clusters
            10,
            '#c49949',  // pb-mustard for medium clusters
            30,
            '#be013c'   // pb-ketchup for large clusters
        ],
        'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            // When hovered, multiply the base radius by 1.3 (30% larger)
            [
                '*',
                [
                    'step',
                    ['get', 'point_count'],
                    20,
                    10,
                    25,
                    30,
                    30
                ],
                1.3
            ],
            // Normal radius
            [
                'step',
                ['get', 'point_count'],
                20,
                10,
                25,
                30,
                30
            ]
        ],
        'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            3,  // Thicker border when hovered
            2
        ],
        'circle-stroke-color': '#322283'  // pb-indigo border
    }
};

const clusterCountLayer: Omit<SymbolLayerSpecification, 'source'> = {
    id: 'cluster-count',
    type: 'symbol',
    filter: ['has', 'point_count'],
    layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': [
            'step',
            ['get', 'point_count'],
            16,
            10,
            18,
            30,
            22
        ]
    }
};

const unclusteredPointLayer: Omit<CircleLayerSpecification, 'source'> = {
    id: 'unclustered-point',
    type: 'circle',
    filter: ['!', ['has', 'point_count']],
    paint: {
        'circle-color': '#9e9ea9',  // pb-gray
        'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            10,  // 25% larger when hovered
            8
        ],
        'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            3,  // Thicker border when hovered
            2
        ],
        'circle-stroke-color': '#322283'  // pb-indigo border
    }
};

function ClusterMap() {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({
        longitude: -30, // Center between US and Europe
        latitude: 45,
        zoom: 2.5 // Zoom out to see both continents
    });
    const [hoveredFeatureId, setHoveredFeatureId] = useState<string | number | null>(null);

    // Generate data only once using useMemo
    const geojsonData: FeatureCollection<Point> = useMemo(() => ({
        type: 'FeatureCollection',
        features: generatePoints()
    }), []); // Empty dependency array means this only runs once

    console.log('GeoJSON data:', geojsonData);
    console.log('Number of points:', geojsonData.features.length);

    const onMouseMove = (event: any) => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        const features = map.queryRenderedFeatures(event.point, {
            layers: ['clusters', 'unclustered-point']
        });

        if (features.length > 0) {
            const feature = features[0];
            if (hoveredFeatureId !== null) {
                map.setFeatureState(
                    { source: 'points', id: hoveredFeatureId },
                    { hover: false }
                );
            }
            setHoveredFeatureId(feature.id as string | number);
            map.setFeatureState(
                { source: 'points', id: feature.id },
                { hover: true }
            );
            map.getCanvas().style.cursor = 'pointer';
        } else {
            if (hoveredFeatureId !== null) {
                map.setFeatureState(
                    { source: 'points', id: hoveredFeatureId },
                    { hover: false }
                );
                setHoveredFeatureId(null);
            }
            map.getCanvas().style.cursor = '';
        }
    };

    const onMouseLeave = () => {
        const map = mapRef.current?.getMap();
        if (!map || hoveredFeatureId === null) return;

        map.setFeatureState(
            { source: 'points', id: hoveredFeatureId },
            { hover: false }
        );
        setHoveredFeatureId(null);
        map.getCanvas().style.cursor = '';
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Map
                ref={mapRef}
                {...viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                mapStyle={defaultMapStyle}
                style={{ width: '100%', height: '100%' }}
                minZoom={1.75}
                maxZoom={6.5}
                interactiveLayerIds={['clusters', 'unclustered-point']}
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
        </div>
    );
}

export default ClusterMap;