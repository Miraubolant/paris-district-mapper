
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DistrictInfoProps {
  district: {
    id: number;
    name: string;
    description: string;
    population: number;
    area: number;
    landmarks: string[];
  };
  onClose: () => void;
}

export const DistrictInfo = ({ district, onClose }: DistrictInfoProps) => {
  return (
    <div className="absolute top-4 right-4 w-full max-w-md z-10 animate-slideIn">
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-purple-200">
        <CardHeader className="relative pb-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute right-2 top-2"
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl text-purple-900 font-serif">
            {district.name}
          </CardTitle>
          <CardDescription className="text-purple-700">
            {district.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-2">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Population</p>
              <p className="font-medium">{district.population.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Superficie</p>
              <p className="font-medium">{district.area} km²</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Densité</p>
              <p className="font-medium">{Math.round(district.population / district.area).toLocaleString()} hab/km²</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Points d'intérêt</p>
            <div className="flex flex-wrap gap-1">
              {district.landmarks.map((landmark, index) => (
                <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {landmark}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button variant="outline" className="w-full text-purple-700 border-purple-300 hover:bg-purple-50">
            En savoir plus
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
