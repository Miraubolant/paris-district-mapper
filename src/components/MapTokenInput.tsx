
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface MapTokenInputProps {
  onTokenSubmit: (token: string) => void;
}

export const MapTokenInput = ({ onTokenSubmit }: MapTokenInputProps) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Veuillez entrer un token Mapbox');
      return;
    }
    
    if (!token.startsWith('pk.')) {
      setError('Le token semble invalide. Il devrait commencer par "pk."');
      return;
    }
    
    setError('');
    onTokenSubmit(token);
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-2xl font-serif text-purple-900">Paris District Mapper</CardTitle>
        <CardDescription>
          Pour afficher la carte de Paris et ses arrondissements, veuillez entrer votre token public Mapbox.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="mapbox-token" className="text-sm font-medium">
                Token public Mapbox
              </label>
              <Input
                id="mapbox-token"
                placeholder="pk.eyJ1Ijoi..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className={error ? 'border-red-300' : ''}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Pour obtenir un token Mapbox :</p>
              <ol className="list-decimal pl-5 space-y-1 mt-1">
                <li>Créez un compte sur <a href="https://www.mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a></li>
                <li>Accédez à votre tableau de bord</li>
                <li>Allez dans la section "Tokens"</li>
                <li>Copiez votre token public par défaut</li>
              </ol>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800">
            Afficher la carte
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
