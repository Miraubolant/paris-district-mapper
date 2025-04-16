
import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

export interface SavedPoint {
  id: string;
  name: string;
  coordinates: [number, number];
  notes?: string;
}

interface SavedPointsProps {
  points: SavedPoint[];
  onDeletePoint: (id: string) => void;
  onSelectPoint: (point: SavedPoint) => void;
}

export const SavedPoints: React.FC<SavedPointsProps> = ({ 
  points, 
  onDeletePoint,
  onSelectPoint 
}) => {
  if (points.length === 0) {
    return (
      <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-md mb-4">
        <p className="text-purple-800 text-sm italic">
          Aucun point sauvegardé. Cliquez sur la carte et utilisez le bouton "Sauvegarder ce lieu" pour ajouter des points.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md mb-4 max-h-[30vh] overflow-y-auto">
      <h3 className="text-lg font-serif font-semibold text-purple-900 p-3 border-b border-purple-100">
        Vos lieux sauvegardés
      </h3>
      <ul className="divide-y divide-purple-100">
        {points.map((point) => (
          <li key={point.id} className="p-3 hover:bg-purple-50 transition-colors flex justify-between items-center">
            <button 
              onClick={() => onSelectPoint(point)}
              className="text-left flex-1"
            >
              <span className="font-medium text-purple-900">{point.name}</span>
              {point.notes && (
                <p className="text-sm text-gray-600 truncate">{point.notes}</p>
              )}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeletePoint(point.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <X size={16} />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};
