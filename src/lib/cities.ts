export interface City {
  name: string;
  region: string;
  population?: number;
  latitude: number;
  longitude: number;
}

export const moroccanCities: City[] = [
  // Grandes villes
  { name: "Casablanca", region: "Casablanca-Settat", population: 3359818, latitude: 33.5731, longitude: -7.5898 },
  { name: "Rabat", region: "Rabat-Salé-Kénitra", population: 577827, latitude: 34.0209, longitude: -6.8416 },
  { name: "Fès", region: "Fès-Meknès", population: 1112072, latitude: 34.0333, longitude: -5.0000 },
  { name: "Marrakech", region: "Marrakech-Safi", population: 928850, latitude: 31.6295, longitude: -7.9811 },
  { name: "Tanger", region: "Tanger-Tétouan-Al Hoceïma", population: 947952, latitude: 35.7595, longitude: -5.8340 },
  { name: "Meknès", region: "Fès-Meknès", population: 632079, latitude: 33.8935, longitude: -5.5547 },
  { name: "Oujda", region: "Oriental", population: 494252, latitude: 34.6867, longitude: -1.9114 },
  { name: "Kénitra", region: "Rabat-Salé-Kénitra", population: 431282, latitude: 34.2610, longitude: -6.5802 },
  { name: "Agadir", region: "Souss-Massa", population: 421844, latitude: 30.4278, longitude: -9.5981 },
  { name: "Tétouan", region: "Tanger-Tétouan-Al Hoceïma", population: 380787, latitude: 35.5789, longitude: -5.3626 },
  
  // Villes moyennes
  { name: "Safi", region: "Marrakech-Safi", population: 308508, latitude: 32.2994, longitude: -9.2372 },
  { name: "Mohammedia", region: "Casablanca-Settat", population: 208612, latitude: 33.6866, longitude: -7.3830 },
  { name: "El Jadida", region: "Casablanca-Settat", population: 194934, latitude: 33.2316, longitude: -8.5007 },
  { name: "Béni Mellal", region: "Béni Mellal-Khénifra", population: 192676, latitude: 32.3373, longitude: -6.3498 },
  { name: "Nador", region: "Oriental", population: 161726, latitude: 35.1667, longitude: -2.9333 },
  
  // Villes touristiques
  { name: "Chefchaouen", region: "Tanger-Tétouan-Al Hoceïma", population: 42786, latitude: 35.1688, longitude: -5.2636 },
  { name: "Essaouira", region: "Marrakech-Safi", population: 77966, latitude: 31.5085, longitude: -9.7595 },
  { name: "Ouarzazate", region: "Drâa-Tafilalet", population: 71067, latitude: 30.9335, longitude: -6.8956 },
  { name: "Merzouga", region: "Drâa-Tafilalet", latitude: 31.0819, longitude: -4.0088 },
  { name: "Ifrane", region: "Fès-Meknès", population: 73782, latitude: 33.5333, longitude: -5.1000 },
  
  // Villes côtières
  { name: "Al Hoceima", region: "Tanger-Tétouan-Al Hoceïma", population: 55357, latitude: 35.2517, longitude: -3.9372 },
  { name: "Asilah", region: "Tanger-Tétouan-Al Hoceïma", population: 31147, latitude: 35.4667, longitude: -6.0333 },
  { name: "Larache", region: "Tanger-Tétouan-Al Hoceïma", population: 125008, latitude: 35.1933, longitude: -6.1562 },
  { name: "Dakhla", region: "Dakhla-Oued Ed-Dahab", population: 106277, latitude: 23.7148, longitude: -15.9362 },
  
  // Villes historiques
  { name: "Taroudant", region: "Souss-Massa", population: 80149, latitude: 30.4703, longitude: -8.8766 },
  { name: "Taza", region: "Fès-Meknès", population: 139686, latitude: 34.2167, longitude: -4.0167 },
  { name: "Khemisset", region: "Rabat-Salé-Kénitra", population: 131542, latitude: 33.8242, longitude: -6.0658 },
  { name: "Tiznit", region: "Souss-Massa", population: 74699, latitude: 29.7000, longitude: -9.7333 },
  
  // Autres villes importantes
  { name: "Salé", region: "Rabat-Salé-Kénitra", population: 890403, latitude: 34.0333, longitude: -6.8000 },
  { name: "Khouribga", region: "Béni Mellal-Khénifra", population: 196196, latitude: 32.8811, longitude: -6.9063 },
  { name: "Settat", region: "Casablanca-Settat", population: 142250, latitude: 33.0000, longitude: -7.6167 },
  { name: "Berrechid", region: "Casablanca-Settat", population: 136634, latitude: 33.2653, longitude: -7.5877 },
  { name: "Khénifra", region: "Béni Mellal-Khénifra", population: 117510, latitude: 32.9333, longitude: -5.6667 },
  { name: "Taourirt", region: "Oriental", population: 80024, latitude: 34.4000, longitude: -2.8833 }
];

// Grouper les villes par région
export const citiesByRegion = moroccanCities.reduce((acc, city) => {
  if (!acc[city.region]) {
    acc[city.region] = [];
  }
  acc[city.region].push(city);
  return acc;
}, {} as Record<string, City[]>);

// Liste des régions
export const regions = [...new Set(moroccanCities.map(city => city.region))].sort();

// Fonction pour rechercher des villes
export function searchCities(query: string): City[] {
  const normalizedQuery = query.toLowerCase().trim();
  return moroccanCities.filter(city => 
    city.name.toLowerCase().includes(normalizedQuery) ||
    city.region.toLowerCase().includes(normalizedQuery)
  );
}