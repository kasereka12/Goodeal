import { all } from 'axios';
import { Home, Car, Briefcase, Paintbrush } from 'lucide-react';

// Fonction utilitaire pour obtenir les modèles d'une marque
export function getModelsForBrand(category: 'vehicules', brandName: string) {
  // Normaliser le nom de la marque pour la comparaison
  const normalizedBrandName = brandName.toLowerCase();

  // Trouver la marque correspondante
  const brandKey = Object.keys(brands[category]).find(
    key => key.toLowerCase() === normalizedBrandName
  );

  if (!brandKey) {
    console.warn(`No models found for brand: ${brandName}`);
    return [];
  }

  // Retourner les modèles formatés
  return brands[category][brandKey as keyof typeof brands[typeof category]].map(model => ({
    value: model.toLowerCase(),
    label: model
  }));
}

// Définition des marques et modèles
export const brands = {
  vehicules: {
    'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8'],
    'BMW': ['Série 1', 'Série 2', 'Série 3', 'Série 4', 'Série 5', 'Série 7', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7'],
    'Mercedes-Benz': ['Classe A', 'Classe B', 'Classe C', 'Classe E', 'Classe S', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS'],
    'Volkswagen': ['Polo', 'Golf', 'Passat', 'T-Roc', 'Tiguan', 'Touareg'],
    'Peugeot': ['208', '308', '2008', '3008', '5008'],
    'Renault': ['Clio', 'Captur', 'Megane', 'Arkana', 'Scenic', 'Kadjar'],
    'Toyota': ['Yaris', 'Corolla', 'C-HR', 'RAV4', 'Camry', 'Land Cruiser'],
    'Honda': ['Civic', 'CR-V', 'HR-V', 'Jazz'],
    'Hyundai': ['i10', 'i20', 'i30', 'Kona', 'Tucson', 'Santa Fe'],
    'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Sorento', 'EV6']
  } as const
} as const;

// Définition des catégories
export const categories = {
  immobilier: {
    label: 'Immobilier',
    icon: Home,
    filters: {
      transaction_type: {
        label: 'Type de transaction',
        type: 'select',
        options: [
          { value: 'achat', label: 'Achat' },
          { value: 'location', label: 'Location' },
        ],
      },
      type: {
        label: 'Type de bien',
        type: 'select',
        options: [
          { value: 'appartement', label: 'Appartement' },
          { value: 'maison', label: 'Maison' },
          { value: 'villa', label: 'Villa' },
          { value: 'riad', label: 'Riad' },
          { value: 'terrain', label: 'Terrain' },
          { value: 'bureau', label: 'Bureau' },
          { value: 'local_commercial', label: 'Local commercial' },
        ],
      },
      surface: {
        label: 'Surface (m²)',
        type: 'range',
        min: 0,
        max: 500,
        step: 10,
        unit: 'm²'
      },
      pieces: {
        label: 'Nombre de pièces',
        type: 'select',
        options: [
          { value: '1', label: '1 pièce' },
          { value: '2', label: '2 pièces' },
          { value: '3', label: '3 pièces' },
          { value: '4', label: '4 pièces' },
          { value: '5', label: '5 pièces et plus' },
        ],
      },
      meuble: {
        label: 'Meublé',
        type: 'boolean',
      },
      jardin: {
        label: 'Jardin',
        type: 'boolean',
      },
      piscine: {
        label: 'Piscine',
        type: 'boolean',
      },
      garage: {
        label: 'Garage',
        type: 'boolean',
      },
    },
  },
  vehicules: {
    label: 'Auto-moto & Engins',
    icon: Car,
    filters: {
      transaction_type: {
        label: 'Type de transaction',
        type: 'select',
        options: [
          { value: 'achat', label: 'Achat' },
          { value: 'location', label: 'Location' },
        ],
      },
      marque: {
        label: 'Marque',
        type: 'select',
        options: Object.keys(brands.vehicules).map(brand => ({
          value: brand.toLowerCase(),
          label: brand
        })),
      },
      modele: {
        label: 'Modèle',
        type: 'select',
        options: [], // Sera rempli dynamiquement selon la marque
        dependent: 'marque',
      },
      annee: {
        label: 'Année',
        type: 'select',
        options: Array.from({ length: 30 }, (_, i) => {
          const year = new Date().getFullYear() - i;
          return { value: year.toString(), label: year.toString() };
        }),
      },
      kilometrage: {
        label: 'Kilométrage',
        type: 'range',
        min: 0,
        max: 300000,
        step: 5000,
        unit: 'km'
      },
      carburant: {
        label: 'Carburant',
        type: 'select',
        options: [
          { value: 'essence', label: 'Essence' },
          { value: 'diesel', label: 'Diesel' },
          { value: 'hybride', label: 'Hybride' },
          { value: 'electrique', label: 'Électrique' },
          { value: 'gpl', label: 'GPL' },
        ],
      },
      boite: {
        label: 'Boîte de vitesse',
        type: 'select',
        options: [
          { value: 'manuelle', label: 'Manuelle' },
          { value: 'automatique', label: 'Automatique' },
        ],
      },
    },
  },
  services: {
    label: 'Services',
    icon: Briefcase,
    filters: {
      type: {
        label: 'Type de service',
        type: 'select',
        options: [
          { value: 'cours', label: 'Cours particuliers' },
          { value: 'bricolage', label: 'Bricolage' },
          { value: 'jardinage', label: 'Jardinage' },
          { value: 'menage', label: 'Ménage' },
          { value: 'informatique', label: 'Informatique' },
          { value: 'evenementiel', label: 'Événementiel' },
          { value: 'transport', label: 'Transport' },
          { value: 'autre', label: 'Autre' },
        ],
      },
      experience: {
        label: 'Expérience',
        type: 'select',
        options: [
          { value: 'debutant', label: 'Débutant' },
          { value: 'intermediaire', label: 'Intermédiaire' },
          { value: 'expert', label: 'Expert' },
          { value: 'professionnel', label: 'Professionnel' },
        ],
      },
      deplacement: {
        label: 'Déplacement à domicile',
        type: 'boolean',
      },
    },
  },
  artisanat: {
    label: 'Déco & Artisanat',
    icon: Paintbrush,
    filters: {
      type: {
        label: 'Type d\'article',
        type: 'select',
        options: [
          { value: 'tapis', label: 'Tapis' },
          { value: 'poterie', label: 'Poterie' },
          { value: 'bijoux', label: 'Bijoux' },
          { value: 'cuir', label: 'Articles en cuir' },
          { value: 'bois', label: 'Objets en bois' },
          { value: 'textile', label: 'Textile' },
          { value: 'decoration', label: 'Décoration' },
          { value: 'tableaux', label: 'Tableaux & Art' },
          { value: 'autre', label: 'Autre' },
        ],
      },
      origine: {
        label: 'Origine',
        type: 'select',
        options: [
          { value: 'maroc', label: 'Maroc' },
          { value: 'afrique', label: 'Afrique' },
          { value: 'asie', label: 'Asie' },
          { value: 'europe', label: 'Europe' },
          { value: 'amerique', label: 'Amérique' },
          { value: 'autre', label: 'Autre' },
        ],
      },
      matiere: {
        label: 'Matière',
        type: 'select',
        options: [
          { value: 'laine', label: 'Laine' },
          { value: 'coton', label: 'Coton' },
          { value: 'cuir', label: 'Cuir' },
          { value: 'bois', label: 'Bois' },
          { value: 'metal', label: 'Métal' },
          { value: 'ceramique', label: 'Céramique' },
          { value: 'verre', label: 'Verre' },
          { value: 'pierre', label: 'Pierre' },
          { value: 'autre', label: 'Autre' },
        ],
      },
      fait_main: {
        label: 'Fait main',
        type: 'boolean',
      },
      authentique: {
        label: 'Authentique',
        type: 'boolean',
      },
      ancien: {
        label: 'Ancien/Vintage',
        type: 'boolean',
      },
      dimensions: {
        label: 'Dimensions',
        type: 'select',
        options: [
          { value: 'petit', label: 'Petit' },
          { value: 'moyen', label: 'Moyen' },
          { value: 'grand', label: 'Grand' },
          { value: 'tres_grand', label: 'Très grand' },
        ],
      },
    },
  },
} as const;

export type CategoryId = keyof typeof categories;
export type Category = typeof categories[CategoryId];
export type Filter = Category['filters'][keyof Category['filters']];