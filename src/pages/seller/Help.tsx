import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone, MessageSquare, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SellerHelp() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: t('faq.listingQuestion') || 'Comment créer une annonce ?',
      answer: t('faq.listingAnswer') || 'Pour créer une annonce, cliquez sur le bouton "Déposer une annonce" dans la barre de navigation ou dans votre tableau de bord vendeur. Suivez ensuite les étapes pour ajouter les détails, les photos et le prix de votre article.'
    },
    {
      question: t('faq.messageQuestion') || 'Comment répondre aux messages des acheteurs ?',
      answer: t('faq.messageAnswer') || 'Vous pouvez accéder à tous vos messages dans la section "Messages" de votre tableau de bord vendeur. Cliquez sur une conversation pour voir les messages et y répondre.'
    },
    {
      question: t('faq.paymentQuestion') || 'Comment sont gérés les paiements ?',
      answer: t('faq.paymentAnswer') || 'Les paiements sont sécurisés via notre système. Lorsqu\'un acheteur effectue un achat, l\'argent est mis en attente jusqu\'à ce que l\'acheteur confirme la réception de l\'article. Vous recevrez ensuite le paiement sur votre compte bancaire associé.'
    },
    {
      question: t('faq.feesQuestion') || 'Quels sont les frais pour les vendeurs ?',
      answer: t('faq.feesAnswer') || 'Goodeal prélève une commission de 5% sur chaque vente réussie. Il n\'y a pas de frais pour publier une annonce ou communiquer avec les acheteurs.'
    },
    {
      question: t('faq.promotionQuestion') || 'Comment promouvoir mes annonces ?',
      answer: t('faq.promotionAnswer') || 'Vous pouvez augmenter la visibilité de vos annonces en ajoutant des photos de qualité, des descriptions détaillées et en répondant rapidement aux messages. Des options de promotion premium seront bientôt disponibles.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('nav.help') || 'Centre d\'aide'}
        </h1>
        <Link to="/" className="flex items-center text-sm font-medium text-primary hover:text-primary-dark">
          <Home className="h-4 w-4 mr-1" />
          {t('common.backToHome') || 'Retour à l\'accueil'}
        </Link>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          <HelpCircle className="inline-block h-5 w-5 mr-2 text-primary" />
          {t('faqTitle') || 'Questions fréquentes'}
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="w-full px-4 py-3 text-left flex items-center justify-between focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {t('contactTitle') || 'Besoin d\'aide supplémentaire ?'}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('contactDescription') || 'Notre équipe de support est disponible pour vous aider avec toutes vos questions.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg flex flex-col items-center text-center">
            <Mail className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">{t('email') || 'Email'}</h3>
            <p className="text-gray-600 text-sm">support@goodeal.com</p>
            <p className="text-gray-500 text-xs mt-2">{t('emailResponse') || 'Réponse sous 24h'}</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg flex flex-col items-center text-center">
            <Phone className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">{t('phone') || 'Téléphone'}</h3>
            <p className="text-gray-600 text-sm">+33 1 23 45 67 89</p>
            <p className="text-gray-500 text-xs mt-2">{t('phoneHours') || 'Lun-Ven, 9h-18h'}</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg flex flex-col items-center text-center">
            <MessageSquare className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">{t('chat') || 'Chat en direct'}</h3>
            <p className="text-gray-600 text-sm">{t('chatAvailable') || 'Disponible en ligne'}</p>
            <button className="mt-2 px-3 py-1 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary-dark">
              {t('startChat') || 'Démarrer un chat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
