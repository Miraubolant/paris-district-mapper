
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { SavedPoint } from './SavedPoints';
import { toast } from './ui/sonner';
import { X } from 'lucide-react';

interface SavePointFormProps {
  coordinates: [number, number] | null;
  onSave: (point: Omit<SavedPoint, 'id'>) => void;
  onClose: () => void;
}

export const SavePointForm: React.FC<SavePointFormProps> = ({ 
  coordinates, 
  onSave, 
  onClose 
}) => {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  if (!coordinates) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Veuillez donner un nom à ce lieu');
      return;
    }
    
    onSave({
      name: name.trim(),
      coordinates,
      notes: notes.trim() || undefined
    });
    
    setName('');
    setNotes('');
    toast.success('Point sauvegardé');
    onClose();
  };

  return (
    <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-md p-4 z-10">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-serif font-semibold text-purple-900">Sauvegarder ce lieu</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X size={16} />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mon restaurant préféré"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détails supplémentaires..."
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="text-xs text-gray-500">
            Coordonnées: {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              size="sm"
            >
              Sauvegarder
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
