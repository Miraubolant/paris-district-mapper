
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { parisDistrictsData } from '@/data/parisDistricts';
import { DistrictInfo } from './DistrictInfo';
import { SavedPoints, SavedPoint } from './SavedPoints';
import { SavePointForm } from './SavePointForm';
import { Button } from './ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { toast } from './ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface MapContainerProps {
  mapboxToken: string;
}

export const MapContainer = ({ mapboxToken }: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [savedPoints, setSavedPoints] = useState<SavedPoint[]>(() => {
    const saved = localStorage.getItem('savedMapPoints');
    return saved ? JSON.parse(saved) : [];
  });
  const [clickedPoint, setClickedPoint] = useState<[number, number] | null>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const isMobile = useIsMobile();
  const markerRefs = useRef<{[id: string]: mapboxgl.Marker}>({});
  
  // Configure Mapbox
  mapboxgl.accessToken = mapboxToken;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map with colored style and 3D settings
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [2.3522, 48.8566], // Paris coordinates
      zoom: isMobile ? 11 : 13,
      pitch: 45, // Add pitch for 3D effect
      bearing: 0,
      antialias: true
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    map.current.on('load', () => {
      if (!map.current) return;
      
      // Add 3D buildings layer
      map.current.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 12,
        'paint': {
          'fill-extrusion-color': '#8E9196',
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            16, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            16, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.7
        }
      });
      
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

    // Change cursor on hover
    map.current.on('mousemove', 'district-borders', () => {
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
          zoom: 14,
          pitch: 55, // Increase pitch when zooming to district
          bearing: 20, // Add slight rotation for better 3D view
          duration: 1500,
          essential: true
        });
      }
    });

    // Handle click on the map to save location
    map.current.on('click', (e) => {
      // Don't trigger if clicking on a district or a marker
      const features = map.current?.queryRenderedFeatures(e.point, { 
        layers: ['district-borders'] 
      });
      
      if (features && features.length > 0) return;
      
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setClickedPoint(coordinates);
      setShowSaveForm(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isMobile]);

  // Load saved points markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    // Clear old markers
    Object.values(markerRefs.current).forEach(marker => marker.remove());
    markerRefs.current = {};
    
    // Add new markers for saved points
    savedPoints.forEach(point => {
      const marker = new mapboxgl.Marker({ color: '#7E69AB' })
        .setLngLat(point.coordinates)
        .addTo(map.current!);
      
      markerRefs.current[point.id] = marker;
    });
    
    // Save to localStorage
    localStorage.setItem('savedMapPoints', JSON.stringify(savedPoints));
  }, [savedPoints, mapLoaded]);

  const handleSavePoint = (pointData: Omit<SavedPoint, 'id'>) => {
    const newPoint: SavedPoint = {
      ...pointData,
      id: Date.now().toString()
    };
    
    setSavedPoints(prev => [...prev, newPoint]);
  };

  const handleDeletePoint = (id: string) => {
    setSavedPoints(prev => prev.filter(point => point.id !== id));
    
    // Remove marker
    if (markerRefs.current[id]) {
      markerRefs.current[id].remove();
      delete markerRefs.current[id];
    }
    
    toast.success('Point supprimé');
  };

  const handleSelectPoint = (point: SavedPoint) => {
    if (!map.current) return;
    
    map.current.flyTo({
      center: point.coordinates,
      zoom: 16,
      pitch: 60,
      bearing: 30,
      duration: 1500
    });
    
    // Highlight marker (bounce effect)
    if (markerRefs.current[point.id]) {
      const marker = markerRefs.current[point.id];
      const el = marker.getElement();
      el.style.transition = 'transform 0.3s ease-in-out';
      
      // Simple bounce animation
      el.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        el.style.transform = 'translateY(0)';
      }, 300);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-20rem)] sm:h-[calc(100vh-16rem)] md:h-[calc(100vh-14rem)] lg:h-[calc(100vh-12rem)]">
      <div className="absolute z-10 top-4 left-4 right-4 flex flex-col gap-2">
        <SavedPoints 
          points={savedPoints} 
          onDeletePoint={handleDeletePoint}
          onSelectPoint={handleSelectPoint}
        />
      </div>
      
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      
      {showSaveForm && clickedPoint && (
        <SavePointForm 
          coordinates={clickedPoint} 
          onSave={handleSavePoint}
          onClose={() => {
            setShowSaveForm(false);
            setClickedPoint(null);
          }}
        />
      )}
      
      {selectedDistrict && (
        <DistrictInfo 
          district={selectedDistrict} 
          onClose={() => setSelectedDistrict(null)} 
        />
      )}
    </div>
  );
};
