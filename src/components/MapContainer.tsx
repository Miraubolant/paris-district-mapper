
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { parisDistrictsData } from '@/data/parisDistricts';
import { DistrictInfo } from './DistrictInfo';

interface MapContainerProps {
  mapboxToken: string;
}

// Couleurs distinctes pour chaque arrondissement
const districtColors = [
  '#9b87f5', '#7E69AB', '#D6BCFA', '#6E59A5', '#5a478b',
  '#41336d', '#C4B5FD', '#FEC6A1', '#FDE1D3', '#FFDEE2',
  '#E5DEFF', '#D3E4FD', '#FEF7CD', '#F2FCE2', '#F1F0FB',
  '#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#403E43'
];

export const MapContainer = ({ mapboxToken }: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Configure Mapbox
  mapboxgl.accessToken = mapboxToken;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [2.3522, 48.8566], // Paris coordinates
      zoom: 11.5,
      pitch: 45, // Ajouter un angle pour voir les bâtiments en 3D
      bearing: -10, // Légère rotation pour un meilleur effet 3D
      antialias: true // Améliorer le rendu
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      if (!map.current) return;
      
      // Activer les bâtiments 3D
      map.current.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 12,
        'paint': {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['get', 'height'],
            0, '#FFFFFF',
            50, '#E5E5E5',
            100, '#CCCCCC',
            200, '#B3B3B3',
            400, '#999999'
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 0,
            12.5, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 0,
            12.5, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.7
        }
      });
      
      map.current.addSource('paris-districts', {
        type: 'geojson',
        data: parisDistrictsData,
      });

      // Ajouter une couche pour les arrondissements avec des couleurs distinctes
      map.current.addLayer({
        id: 'district-fills',
        type: 'fill',
        source: 'paris-districts',
        layout: {},
        paint: {
          'fill-color': [
            'match',
            ['get', 'id'],
            1, districtColors[0],
            2, districtColors[1],
            3, districtColors[2],
            4, districtColors[3],
            5, districtColors[4],
            6, districtColors[5],
            7, districtColors[6],
            8, districtColors[7],
            9, districtColors[8],
            10, districtColors[9],
            11, districtColors[10],
            12, districtColors[11],
            13, districtColors[12],
            14, districtColors[13],
            15, districtColors[14],
            16, districtColors[15],
            17, districtColors[16],
            18, districtColors[17],
            19, districtColors[18],
            20, districtColors[19],
            '#D6BCFA' // Couleur par défaut
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.9,
            0.7
          ]
        }
      });

      map.current.addLayer({
        id: 'district-borders',
        type: 'line',
        source: 'paris-districts',
        layout: {},
        paint: {
          'line-color': '#7E69AB',
          'line-width': 2
        }
      });

      map.current.addLayer({
        id: 'district-numbers',
        type: 'symbol',
        source: 'paris-districts',
        layout: {
          'text-field': ['get', 'id'],
          'text-size': 16,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#1A1F2C',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1
        }
      });

      // Ajouter un effet d'ombre pour améliorer la perception des profondeurs
      map.current.setLight({
        anchor: 'viewport',
        color: '#ffffff',
        intensity: 0.4,
        position: [1.5, 210, 30]
      });

      setMapLoaded(true);
    });

    let hoveredDistrictId: number | null = null;

    // Change cursor and highlight district on hover
    map.current.on('mousemove', 'district-fills', (e) => {
      if (!map.current || !e.features || e.features.length === 0) return;
      
      if (hoveredDistrictId !== null) {
        map.current.setFeatureState(
          { source: 'paris-districts', id: hoveredDistrictId },
          { hover: false }
        );
      }
      
      hoveredDistrictId = e.features[0].properties?.id;
      
      if (hoveredDistrictId !== null) {
        map.current.setFeatureState(
          { source: 'paris-districts', id: hoveredDistrictId },
          { hover: true }
        );
      }
      
      map.current.getCanvas().style.cursor = 'pointer';
    });

    // Reset cursor and highlight when mouse leaves the districts
    map.current.on('mouseleave', 'district-fills', () => {
      if (!map.current) return;
      
      if (hoveredDistrictId !== null) {
        map.current.setFeatureState(
          { source: 'paris-districts', id: hoveredDistrictId },
          { hover: false }
        );
      }
      
      hoveredDistrictId = null;
      map.current.getCanvas().style.cursor = '';
    });

    // Handle click to select district
    map.current.on('click', 'district-fills', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      setSelectedDistrict(feature.properties);
      
      // Fly to the district
      if (map.current && feature.geometry.type === 'Polygon') {
        // Calculate centroid of polygon to center map
        const coordinates = feature.geometry.coordinates[0];
        const lng = coordinates.reduce((sum: number, point: number[]) => sum + point[0], 0) / coordinates.length;
        const lat = coordinates.reduce((sum: number, point: number[]) => sum + point[1], 0) / coordinates.length;
        
        map.current.flyTo({
          center: [lng, lat],
          zoom: 13.5,
          pitch: 60, // Augmenter l'angle pour mieux voir les bâtiments
          bearing: -20,
          duration: 1500,
          essential: true
        });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-7rem)]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      {selectedDistrict && (
        <DistrictInfo 
          district={selectedDistrict} 
          onClose={() => setSelectedDistrict(null)} 
        />
      )}
    </div>
  );
};
