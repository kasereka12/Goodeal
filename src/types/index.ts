export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
}

export interface Listing {
  id: string;
  titre: string;
  description: string;
  prix: number;
  categorie: string;
  sousCategorie?: string;
  images: string[];
  localisation: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  statut: 'actif' | 'en_attente' | 'vendu' | 'archive';
}

export interface Request {
  id: string;
  titre: string;
  description: string;
  categorie: string;
  budget?: number;
  localisation?: string;
  userId: string;
  statut: 'actif' | 'en_attente' | 'ferme';
  createdAt: Date;
}