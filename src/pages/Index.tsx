
import { useState } from 'react';
import { Header } from '@/components/Header';
import { MapContainer } from '@/components/MapContainer';
import { MapTokenInput } from '@/components/MapTokenInput';

const Index = () => {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-4 md:py-6">
        {!mapboxToken ? (
          <MapTokenInput onTokenSubmit={setMapboxToken} />
        ) : (
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-xl md:text-2xl font-serif font-semibold text-purple-900">
              Carte des arrondissements de Paris
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              Explorez les 20 arrondissements de Paris. Chaque arrondissement est délimité par une bordure. 
              Cliquez sur un arrondissement pour voir ses détails ou n'importe où sur la carte pour sauvegarder un point d'intérêt.
            </p>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs md:text-sm text-purple-700">
              <p>Astuce : Utilisez la molette de la souris pour zoomer et les contrôles de navigation pour vous déplacer sur la carte. La carte est en 3D, vous pouvez voir les bâtiments lorsque vous zoomez.</p>
            </div>
            <MapContainer mapboxToken={mapboxToken} />
          </div>
        )}
      </main>
      
      <footer className="bg-purple-900 text-white py-3 md:py-4 mt-4">
        <div className="container mx-auto px-4 text-center text-xs md:text-sm">
          <p>© 2023 Paris District Mapper — Développé avec Lovable</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
