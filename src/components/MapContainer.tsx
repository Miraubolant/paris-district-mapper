
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

    // Initialize map with colored style
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Changed to colored streets style
      center: [2.3522, 48.8566], // Paris coordinates
      zoom: 11.5,
      pitch: 0, // Removed pitch to eliminate 3D effect
      bearing: 0, // Reset rotation
      antialias: true
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    map.current.on('load', () => {
      if (!map.current) return;
      
      map.current.addSource('paris-districts', {
        type: 'geojson',
        data: parisDistrictsData,
      });

      // Add district outlines without fill colors
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

      setMapLoaded(true);
    });

    let hoveredDistrictId: number | null = null;

    // Change cursor on hover
    map.current.on('mousemove', 'district-borders', (e) => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = 'pointer';
    });

    // Reset cursor when mouse leaves the districts
    map.current.on('mouseleave', 'district-borders', () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = '';
    });

    // Handle click to select district
    map.current.on('click', 'district-borders', (e) => {
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
