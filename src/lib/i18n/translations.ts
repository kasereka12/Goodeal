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
      priceDesc: 'Prix décroissant'
    },
    home: {
      hero: {
        title: 'Trouvez ce que vous cherchez sur Goodeaal',
        subtitle: 'Des milliers d\'annonces à portée de main'
      },
      sections: {
        latestListings: 'Dernières annonces',
        realEstate: 'Immobilier',
        vehicles: 'Auto-moto & Engins',
        services: 'Services',
        crafts: 'Déco & Artisanat'
      },
      urbanFive: {
        title: 'Urbain Five, votre complexe sportif à Marrakech',
        subtitle: 'Découvrez nos installations modernes et nos coachs professionnels',
        cta: 'Visiter le site'
      }
    },
    auth: {
      signIn: 'Se connecter',
      signUp: 'S\'inscrire',
      email: 'Email',
      password: 'Mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      alreadyHaveAccount: 'Déjà un compte ?',
      noAccount: 'Pas encore de compte ?',
      logout: 'Se déconnecter',
      profile: 'Profil',
      editProfile: 'Modifier le profil',
      changePassword: 'Changer le mot de passe',
      deleteAccount: 'Supprimer le compte',
      signUpSuccess: 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
      errors: {
        notAuthenticated: 'Vous devez être connecté pour effectuer cette action.'
      }
    },
    nav: {
      postListing: 'Déposer une annonce',
      requests: 'Demandes',
      profile: 'Profil',
      logout: 'Se déconnecter',
      messages: 'Messages',
      notifications: 'Notifications',
      settings: 'Paramètres'
    },
    listings: {
      create: 'Créer une annonce',
      edit: 'Modifier l\'annonce',
      delete: 'Supprimer l\'annonce',
      title: 'Titre',
      description: 'Description',
      price: 'Prix',
      category: 'Catégorie',
      location: 'Localisation',
      images: 'Images',
      contact: 'Contacter le vendeur',
      report: 'Signaler l\'annonce',
      share: 'Partager',
      favorite: 'Favoris',
      views: 'Vues',
      postedOn: 'Publié le',
      by: 'par',
      transactionType: 'Type de transaction',
      buy: 'Achat',
      rent: 'Location'
    },
    requests: {
      title: 'Demandes',
      create: 'Créer une demande',
      searchPlaceholder: 'Rechercher une demande...',
      noResults: 'Aucune demande ne correspond à votre recherche',
      empty: 'Aucune demande pour le moment',
      urgency: {
        label: 'Urgence',
        high: 'Urgent',
        medium: 'Normal',
        low: 'Non urgent'
      },
      status: {
        active: 'Active',
        closed: 'Fermée',
        expired: 'Expirée'
      }
    },
    categories: {
      realEstate: 'Immobilier',
      vehicles: 'Auto-moto & Engins',
      services: 'Services',
      furniture: 'Mobilier',
      fashion: 'Mode',
      books: 'Livres',
      sports: 'Sports',
      games: 'Jeux',
      artisanat: 'Déco & Artisanat',
      other: 'Autre'
    },
    filters: {
      title: 'Filtres',
      reset: 'Réinitialiser les filtres',
      sort: {
        title: 'Trier par',
        date: 'Date',
        price: 'Prix',
        relevance: 'Pertinence'
      },
      transactionType: {
        title: 'Type de transaction',
        buy: 'Achat',
        rent: 'Location'
      }
    },
    profile: {
      title: 'Mon profil',
      displayName: 'Nom de profil',
      displayNamePlaceholder: 'Entrez votre nom de profil',
      noDisplayName: 'Aucun nom de profil',
      photo: 'Photo de profil',
      photoUploadHint: 'Cliquez sur l\'icône pour télécharger une photo',
      photoUploadFormats: 'Formats acceptés: JPG, PNG, GIF (max 5MB)',
      errors: {
        fileSize: 'La taille du fichier ne doit pas dépasser 5MB',
        fileType: 'Formats acceptés: JPG, PNG ou GIF',
        uploadFailed: 'Échec du téléchargement. Veuillez réessayer.'
      }
    },
    footer: {
      description: 'Goodeaal est la première plateforme de petites annonces au Maroc. Trouvez ou vendez ce que vous voulez, où que vous soyez.',
      quickLinks: 'Liens rapides',
      postListing: 'Déposer une annonce',
      requests: 'Demandes',
      safety: 'Conseils de sécurité',
      faq: 'FAQ',
      categories: 'Catégories',
      contact: 'Contact',
      address: 'Twin Center, Tour Ouest,\nAngle Bd Zerktouni et Al Massira,\n20100 Casablanca, Maroc',
      copyright: '© {year} Goodeaal. Tous droits réservés.',
      legal: {
        privacy: 'Politique de confidentialité',
        terms: 'Conditions d\'utilisation',
        legal: 'Mentions légales',
        admin: 'Admin'
      }
    }
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
      priceDesc: 'Price: high to low'
    },
    home: {
      hero: {
        title: 'Find what you are looking for on Goodeaal',
        subtitle: 'Thousands of listings at your fingertips'
      },
      sections: {
        latestListings: 'Latest listings',
        realEstate: 'Real Estate',
        vehicles: 'Cars & Vehicles',
        services: 'Services',
        crafts: 'Decor & Crafts'
      },
      urbanFive: {
        title: 'Urbain Five, your sports complex in Marrakech',
        subtitle: 'Discover our modern facilities and professional coaches',
        cta: 'Visit website'
      }
    },
    auth: {
      signIn: 'Sign in',
      signUp: 'Sign up',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      alreadyHaveAccount: 'Already have an account?',
      noAccount: 'Don\'t have an account?',
      logout: 'Log out',
      profile: 'Profile',
      editProfile: 'Edit profile',
      changePassword: 'Change password',
      deleteAccount: 'Delete account',
      signUpSuccess: 'Sign up successful! You can now sign in.',
      errors: {
        notAuthenticated: 'You must be logged in to perform this action.'
      }
    },
    nav: {
      postListing: 'Post a listing',
      requests: 'Requests',
      profile: 'Profile',
      logout: 'Log out',
      messages: 'Messages',
      notifications: 'Notifications',
      settings: 'Settings'
    },
    listings: {
      create: 'Create listing',
      edit: 'Edit listing',
      delete: 'Delete listing',
      title: 'Title',
      description: 'Description',
      price: 'Price',
      category: 'Category',
      location: 'Location',
      images: 'Images',
      contact: 'Contact seller',
      report: 'Report listing',
      share: 'Share',
      favorite: 'Favorite',
      views: 'Views',
      postedOn: 'Posted on',
      by: 'by',
      transactionType: 'Transaction type',
      buy: 'Buy',
      rent: 'Rent'
    },
    requests: {
      title: 'Requests',
      create: 'Create request',
      searchPlaceholder: 'Search requests...',
      noResults: 'No requests match your search',
      empty: 'No requests yet',
      urgency: {
        label: 'Urgency',
        high: 'Urgent',
        medium: 'Normal',
        low: 'Not urgent'
      },
      status: {
        active: 'Active',
        closed: 'Closed',
        expired: 'Expired'
      }
    },
    categories: {
      realEstate: 'Real Estate',
      vehicles: 'Cars & Vehicles',
      services: 'Services',
      furniture: 'Furniture',
      fashion: 'Fashion',
      books: 'Books',
      sports: 'Sports',
      games: 'Games',
      artisanat: 'Decor & Crafts',
      other: 'Other'
    },
    filters: {
      title: 'Filters',
      reset: 'Reset filters',
      sort: {
        title: 'Sort by',
        date: 'Date',
        price: 'Price',
        relevance: 'Relevance'
      },
      transactionType: {
        title: 'Transaction type',
        buy: 'Buy',
        rent: 'Rent'
      }
    },
    profile: {
      title: 'My profile',
      displayName: 'Display name',
      displayNamePlaceholder: 'Enter your display name',
      noDisplayName: 'No display name',
      photo: 'Profile photo',
      photoUploadHint: 'Click the icon to upload a photo',
      photoUploadFormats: 'Accepted formats: JPG, PNG, GIF (max 5MB)',
      errors: {
        fileSize: 'File size must not exceed 5MB',
        fileType: 'Accepted formats: JPG, PNG or GIF',
        uploadFailed: 'Upload failed. Please try again.'
      }
    },
    footer: {
      description: 'Goodeaal is the premier classifieds platform in Morocco. Find or sell whatever you want, wherever you are.',
      quickLinks: 'Quick links',
      postListing: 'Post a listing',
      requests: 'Requests',
      safety: 'Safety tips',
      faq: 'FAQ',
      categories: 'Categories',
      contact: 'Contact',
      address: 'Twin Center, West Tower,\nCorner of Zerktouni Blvd and Al Massira,\n20100 Casablanca, Morocco',
      copyright: '© {year} Goodeaal. All rights reserved.',
      legal: {
        privacy: 'Privacy policy',
        terms: 'Terms of use',
        legal: 'Legal notice',
        admin: 'Admin'
      }
    }
  }
} as const;