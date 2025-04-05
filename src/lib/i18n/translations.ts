export type Language = 'fr' | 'en';

export const translations = {
  fr: {
    common: {
      search: 'Rechercher',
      searchPlaceholder: 'Que recherchez-vous ?',
      advancedFilters: 'Filtres avancés',
      noResults: 'Aucun résultat trouvé pour "{query}"',
      seeMore: 'Voir plus',
      loading: 'Chargement...',
      price: 'Prix',
      location: 'Localisation',
      category: 'Catégorie',
      all: 'Tous',
      save: 'Sauvegarder',
      edit: 'Modifier',
      delete: 'Supprimer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      back: 'Retour',
      next: 'Suivant',
      finish: 'Terminer',
      filters: 'Filtres',
      status: 'Statut',
      optional: 'Optionnel',
      sortBy: 'Trier par',
      date: 'Date',
      newest: 'Plus récent',
      oldest: 'Plus ancien',
      priceAsc: 'Prix croissant',
      priceDesc: 'Prix décroissant',
      previous: 'Précédent',
      close: 'Fermer',
      reset: 'Réinitialiser'
    },
    search: {
      placeholder: 'Que recherchez-vous ?',
    },
    nav: {
      home: 'Accueil',
      search: 'Rechercher',
      postListing: 'Déposer une annonce',
      chat: 'Messagerie',
      profile: 'Mon profil',
      favorites: 'Favoris',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      notifications: 'Notifications'
    },
    home: {
      heroTitle: 'Trouvez ce qui vous',
      heroHighlight: 'correspond',
      heroSubtitle: 'Des milliers d\'annonces à travers tout le Maroc, prêtes à être découvertes',
      popularTags: 'Populaires',
      categoriesTitle: 'Explorer par catégorie',
      popularCities: 'Villes populaires',
      sections: {
        latestListings: 'Dernières annonces',
        realEstate: 'Immobilier',
        vehicles: 'Véhicules',
        services: 'Services',
        artisanat: 'Artisanat'
      }
    },
    listing: {
      sponsored: 'Sponsorisé',
      recent: 'Annonces récentes',
      noResults: 'Aucune annonce trouvée',
      tryDifferentFilters: 'Essayez de modifier vos critères de recherche',
      forRent: 'À louer',
      forSale: 'À vendre',
      perMonth: 'mois',
      views: 'vues',
      favorites: 'favoris',
      photos: 'photos',
      notFound: "Cette annonce n'existe pas ou a été supprimée",
      description: "Description",
      characteristics: "Caractéristiques",
      location: "Localisation",
      published: "Publié le",
      views: "vues",
      favorites: "favoris",
      photos: "photos",
      forRent: "Location",
      forSale: "Vente",
      perMonth: "/mois",
      safety: {
        title: "Conseils de sécurité",
        tip1: "Ne payez jamais d'avance sans voir l'article",
        tip2: "Rencontrez le vendeur dans un lieu public",
        tip3: "Vérifiez le produit avant de l'acheter",
        tip4: "Méfiez-vous des prix trop bas",
        learnMore: "En savoir plus sur la sécurité"
      }
    },
    urbainFive: {
      title: 'Découvrez Urbain',
      description: 'Votre salle de sport premium en plein cœur de la ville. Equipements de dernière génération et cours exclusifs.',
      cta: 'Visiter le site'
    },
    city: {
      viewListings: 'Voir les annonces'
    },
    filters: {
      title: 'Filtres avancés',
      category: 'Catégorie',
      city: 'Ville',
      priceRange: 'Fourchette de prix (MAD)',
      minPrice: 'Minimum',
      maxPrice: 'Maximum',
      transactionType: 'Type de transaction',
      rent: 'Location',
      sale: 'Achat',
      allCities: 'Toutes les villes',
      applyFilters: 'Appliquer les filtres'
    },
    actions: {
      seeMore: 'Voir plus',
      resetFilters: 'Réinitialiser les filtres',
      search: 'Rechercher'
    },
    date: {
      today: 'Aujourd\'hui',
      yesterday: 'Hier',
      daysAgo: 'Il y a {count} jours'
    },
    categories: {
      immobilier: 'Immobilier',
      vehicules: 'Véhicules',
      services: 'Services',
      artisanat: 'Artisanat',
      realEstate: 'Immobilier',
      vehicles: 'Véhicules',
      electronics: 'Électronique',
    }
    ,

    seller: {
      memberSince: "Membre depuis",
      contact: "Contacter le vendeur",
      viewProfile: "Voir le profil"
    },

    actions: {
      backToHome: "Retour à l'accueil",
      save: "Sauvegarder",
      saved: "Sauvegardé",
      copyLink: "Copier le lien"
    },

    share: {
      copied: "Lien copié !"
    },

    general: {
      yes: "Oui",
      no: "Non"
    },

    breadcrumb: {
      home: "Accueil"
    },
    // Ajout des traductions manquantes pour les tags populaires
    tags: {
      appartements: 'Appartements',
      voitures: 'Voitures',
      cours: 'Cours',
      mobilier: 'Mobilier'
    },
    safety: {
      title: "Conseils de sécurité",
      tip1: "Ne payez jamais d'avance sans voir l'article",
      tip2: "Rencontrez le vendeur dans un lieu public",
      tip3: "Vérifiez le produit avant de l'acheter",
      tip4: "Méfiez-vous des prix trop bas",
      learnMore: "En savoir plus sur la sécurité"
    },
    footer: {
      description: "La première plateforme d'annonces au Maroc. Trouvez tout ce dont vous avez besoin ou vendez facilement ce que vous n'utilisez plus.",
      quickLinks: "Liens rapides",
      postListing: "Déposer une annonce",
      requests: "Demandes",
      safety: "Sécurité",
      faq: "FAQ",
      categories: "Catégories",
      contact: "Contact",
      address: "123 Boulevard Mohammed V, Casablanca, Maroc",
      downloadApp: "Téléchargez notre application",
      appPromo: "Accédez à GoodDeal où que vous soyez",
      copyright: "Tous droits réservés.",
      legal: {
        privacy: "Politique de confidentialité",
        terms: "Conditions d'utilisation",
        legal: "Mentions légales",
        admin: "Administration"
      }
    },
  },
  en: {
    common: {
      search: 'Search',
      searchPlaceholder: 'What are you looking for?',
      advancedFilters: 'Advanced filters',
      noResults: 'No results found for "{query}"',
      seeMore: 'See more',
      loading: 'Loading...',
      price: 'Price',
      location: 'Location',
      category: 'Category',
      all: 'All',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
      filters: 'Filters',
      status: 'Status',
      optional: 'Optional',
      sortBy: 'Sort by',
      date: 'Date',
      newest: 'Newest',
      oldest: 'Oldest',
      priceAsc: 'Price: low to high',
      priceDesc: 'Price: high to low',
      previous: 'Previous',
      close: 'Close',
      reset: 'Reset'
    },
    search: {
      placeholder: 'what are you looking for ?',
    },
    nav: {
      home: 'Accueil',
      search: 'Rechercher',
      postListing: 'Déposer une annonce',
      chat: 'Messagerie',
      profile: 'Mon profil',
      favorites: 'Favoris',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      notifications: 'Notifications'
    },
    home: {
      heroTitle: 'Find what',
      heroHighlight: 'suits you',
      heroSubtitle: 'Thousands of listings across Morocco, ready to be discovered',
      popularTags: 'Popular',
      categoriesTitle: 'Explore by category',
      popularCities: 'Popular cities',
      sections: {
        latestListings: 'Latest listings',
        realEstate: 'Real Estate',
        vehicles: 'Vehicles',
        services: 'Services',
        artisanat: 'Crafts'
      }
    },
    listing: {
      sponsored: 'Sponsored',
      recent: 'Recent listings',
      noResults: 'No listings found',
      tryDifferentFilters: 'Try different search criteria',
      forRent: 'For rent',
      forSale: 'For sale',
      perMonth: 'month',
      views: 'views',
      favorites: 'favorites',
      photos: 'photos',
      notFound: "Cette annonce n'existe pas ou a été supprimée",
      description: "Description",
      characteristics: "Caractéristiques",
      location: "Localisation",
      published: "Publié le",
      views: "vues",
      favorites: "favoris",
      photos: "photos",
      forRent: "Location",
      forSale: "Vente",
      perMonth: "/mois",
      safety: {
        title: "Conseils de sécurité",
        tip1: "Ne payez jamais d'avance sans voir l'article",
        tip2: "Rencontrez le vendeur dans un lieu public",
        tip3: "Vérifiez le produit avant de l'acheter",
        tip4: "Méfiez-vous des prix trop bas",
        learnMore: "En savoir plus sur la sécurité"
      }
    },
    safety: {
      title: "Conseils de sécurité",
      tip1: "Ne payez jamais d'avance sans voir l'article",
      tip2: "Rencontrez le vendeur dans un lieu public",
      tip3: "Vérifiez le produit avant de l'acheter",
      tip4: "Méfiez-vous des prix trop bas",
      learnMore: "En savoir plus sur la sécurité"
    },

    seller: {
      memberSince: "Membre depuis",
      contact: "Contacter le vendeur",
      viewProfile: "Voir le profil"
    },

    actions: {
      backToHome: "Retour à l'accueil",
      save: "Sauvegarder",
      saved: "Sauvegardé",
      copyLink: "Copier le lien"
    },

    share: {
      copied: "Lien copié !"
    },

    general: {
      yes: "Oui",
      no: "Non"
    },

    breadcrumb: {
      home: "Accueil"
    },
    urbainFive: {
      title: 'Discover Urbain',
      description: 'Your premium gym in the heart of the city. State-of-the-art equipment and exclusive classes.',
      cta: 'Visit website'
    },
    city: {
      viewListings: 'View listings'
    },
    filters: {
      title: 'Advanced filters',
      category: 'Category',
      city: 'City',
      priceRange: 'Price range (MAD)',
      minPrice: 'Minimum',
      maxPrice: 'Maximum',
      transactionType: 'Transaction type',
      rent: 'Rent',
      sale: 'Sale',
      allCities: 'All cities',
      applyFilters: 'Apply filters'
    },
    actions: {
      seeMore: 'See more',
      resetFilters: 'Reset filters',
      search: 'Search'
    },
    date: {
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: '{count} days ago'
    },
    categories: {
      immobilier: 'Real Estate',
      vehicules: 'Vehicles',
      services: 'Services',
      artisanat: 'Crafts',
      realEstate: 'Immobilier',
      vehicles: 'Véhicules',
      electronics: 'Électronique',
    },
    // Added missing translations for popular tags
    tags: {
      appartements: 'Apartments',
      voitures: 'Cars',
      cours: 'Courses',
      mobilier: 'Furniture'
    },
    footer: {
      description: "La première plateforme d'annonces au Maroc. Trouvez tout ce dont vous avez besoin ou vendez facilement ce que vous n'utilisez plus.",
      quickLinks: "Liens rapides",
      postListing: "Déposer une annonce",
      requests: "Demandes",
      safety: "Sécurité",
      faq: "FAQ",
      categories: "Catégories",
      contact: "Contact",
      address: "123 Boulevard Mohammed V, Casablanca, Maroc",
      downloadApp: "Téléchargez notre application",
      appPromo: "Accédez à GoodDeal où que vous soyez",
      copyright: "Tous droits réservés.",
      legal: {
        privacy: "Politique de confidentialité",
        terms: "Conditions d'utilisation",
        legal: "Mentions légales",
        admin: "Administration"
      }
    },
  }
} as const;

// Interface pour le type des traductions
export type TranslationKey = {
  [K in keyof typeof translations.fr]: typeof translations.fr[K] extends object
  ? { [P in keyof typeof translations.fr[K]]: string }
  : string
};

// Helper type pour les clés imbriquées
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType]: ObjectType[Key] extends object
  ? `${string & Key}.${string & NestedKeyOf<ObjectType[Key]>}`
  : Key
}[keyof ObjectType];

export type TranslationPath = NestedKeyOf<typeof translations.fr>;