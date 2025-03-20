import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, MessageSquare, User, Calendar, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getRequests } from '../lib/requests';
import { categories } from '../lib/categories';

// Fonction utilitaire pour obtenir la couleur selon l'urgence
const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Interface pour les demandes
interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: 'high' | 'medium' | 'low';
  budget?: number;
  city?: string;
  status: 'active' | 'closed' | 'expired';
  created_at: string;
  user_data: {
    id: string;
    email: string;
    user_metadata?: {
      display_name?: string;
    };
  };
}

export default function Requests() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  // Charger les demandes
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getRequests();
        setRequests(data || []);
      } catch (err: any) {
        console.error('Error fetching requests:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Filtrer les demandes
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUrgency = !selectedUrgency || request.urgency === selectedUrgency;
    const matchesCategory = !selectedCategory || request.category === selectedCategory;
    return matchesSearch && matchesUrgency && matchesCategory;
  });

  // Gérer le clic sur une demande
  const handleRequestClick = (request: Request) => {
    setSelectedRequest(request);
  };

  // Fermer la modal
  const closeModal = () => {
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('requests.title')}</h1>
        <Link to="/create-request" className="btn btn-primary">
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('requests.create')}
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('requests.searchPlaceholder')}
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filtre par urgence */}
          <select
            className="input"
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
          >
            <option value="">{t('common.all')}</option>
            <option value="high">{t('requests.urgency.high')}</option>
            <option value="medium">{t('requests.urgency.medium')}</option>
            <option value="low">{t('requests.urgency.low')}</option>
          </select>

          {/* Filtre par catégorie */}
          <select
            className="input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">{t('common.all')}</option>
            {Object.entries(categories).map(([id, category]) => (
              <option key={id} value={id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* État de chargement */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Liste des demandes */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <button
              key={request.id}
              onClick={() => handleRequestClick(request)}
              className="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow w-full"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-lg">{request.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                  {t(`requests.urgency.${request.urgency}`)}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {request.description}
              </p>
              <div className="space-y-2 mb-4">
                {request.budget && (
                  <p className="text-sm flex items-center gap-2">
                    <span className="font-medium">Budget:</span> {request.budget.toLocaleString()} MAD
                  </p>
                )}
                {request.city && (
                  <p className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {request.city}
                  </p>
                )}
                <p className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  {request.user_data.user_metadata?.display_name || request.user_data.email.split('@')[0]}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  {categories[request.category]?.label}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.status === 'active' ? 'bg-green-100 text-green-800' :
                  request.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {t(`requests.status.${request.status}`)}
                </span>
              </div>
            </button>
          ))}

          {filteredRequests.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              {searchQuery ? t('requests.noResults') : t('requests.empty')}
            </div>
          )}
        </div>
      )}

      {/* Modal de détails et contact */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">{selectedRequest.title}</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedRequest.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Détails</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        {selectedRequest.user_data.user_metadata?.display_name || 
                         selectedRequest.user_data.email.split('@')[0]}
                      </li>
                      {selectedRequest.city && (
                        <li className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {selectedRequest.city}
                        </li>
                      )}
                      <li className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(selectedRequest.created_at).toLocaleDateString()}
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Informations</h3>
                    <ul className="space-y-2">
                      {selectedRequest.budget && (
                        <li className="text-sm">
                          <span className="font-medium">Budget:</span>{' '}
                          {selectedRequest.budget.toLocaleString()} MAD
                        </li>
                      )}
                      <li className="text-sm">
                        <span className="font-medium">Catégorie:</span>{' '}
                        {categories[selectedRequest.category]?.label}
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Urgence:</span>{' '}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          getUrgencyColor(selectedRequest.urgency)
                        }`}>
                          {t(`requests.urgency.${selectedRequest.urgency}`)}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-4 pt-4 border-t">
                  {user ? (
                    user.id !== selectedRequest.user_data.id ? (
                      <button className="btn btn-primary flex-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contacter
                      </button>
                    ) : (
                      <p className="text-gray-500 text-sm">Ceci est votre demande</p>
                    )
                  ) : (
                    <Link to="/auth" className="btn btn-primary flex-1">
                      <User className="h-4 w-4 mr-2" />
                      Se connecter pour contacter
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}