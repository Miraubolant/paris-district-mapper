
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { parisDistrictsData } from '@/data/parisDistricts';
import { DistrictInfo } from './DistrictInfo';

interface MapContainerProps {
  mapboxToken: string;
}

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
      
      map.current.addSource('paris-districts', {
        type: 'geojson',
        data: parisDistrictsData,
      });

      map.current.addLayer({
        id: 'district-fills',
        type: 'fill',
        source: 'paris-districts',
        layout: {},
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#9b87f5',
            '#D6BCFA'
          ],
          'fill-opacity': 0.7
        }
      });

      map.current.addLayer({
        id: 'district-borders',
        type: 'line',
        source: 'paris-districts',
        layout: {},
        paint: {
          'line-color': '#7E69AB',
          'line-width': 1.5
        }
      });

      map.current.addLayer({
        id: 'district-numbers',
        type: 'symbol',
        source: 'paris-districts',
        layout: {
          'text-field': ['get', 'id'],
          'text-size': 14,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#1A1F2C'
        }
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
          zoom: 13,
          duration: 1000
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
