import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Shield, ArrowRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [activeNewsletter, setActiveNewsletter] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setActiveNewsletter(true);
    // Simulation d'inscription
    setTimeout(() => {
      setActiveNewsletter(false);
      setEmail('');
    }, 2000);
  };

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t">
      <div className="container mx-auto px-4 pt-16 pb-8">


        {/* Main grid with improved styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo and description */}
          <div className="space-y-6">
            <div className="transform hover:scale-105 transition-transform">
              <Logo />
            </div>
            <p className="text-gray-600 leading-relaxed">
              {t('footer.description', 'La première plateforme d\'annonces au Maroc. Trouvez tout ce dont vous avez besoin ou vendez facilement ce que vous n\'utilisez plus.')}
            </p>
            {/* Social media with hover effects */}
            <div className="flex gap-4">
              {[
                { Icon: Facebook, href: 'https://facebook.com', color: 'hover:text-blue-600' },
                { Icon: Instagram, href: 'https://instagram.com', color: 'hover:text-pink-600' },
                { Icon: Twitter, href: 'https://twitter.com', color: 'hover:text-blue-400' },
                { Icon: Youtube, href: 'https://youtube.com', color: 'hover:text-red-600' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 bg-gray-100 rounded-full text-gray-600 transition-all ${social.color} hover:bg-white hover:shadow-md`}
                  aria-label={social.Icon.name}
                >
                  <social.Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links with better hover effects */}
          <div>
            <h3 className="font-bold text-gray-900 mb-5 text-lg">{t('footer.quickLinks', 'Liens rapides')}</h3>
            <ul className="space-y-3 pl-1">
              {[
                { to: '/create-listing', label: t('footer.postListing', 'Déposer une annonce') },
                { to: '/requests', label: t('footer.requests', 'Demandes') },
                { to: '/safety', label: t('footer.safety', 'Sécurité') },
                { to: '/faq', label: t('footer.faq', 'FAQ') }
              ].map((link, index) => (
                <li key={index} className="transform transition-transform group">
                  <Link to={link.to} className="text-gray-600 group-hover:text-blue-600 transition-colors flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories with icons */}
          <div>
            <h3 className="font-bold text-gray-900 mb-5 text-lg">{t('footer.categories', 'Catégories')}</h3>
            <ul className="space-y-3 pl-1">
              {[
                { to: '/category/immobilier', label: t('categories.realEstate', 'Immobilier') },
                { to: '/category/vehicules', label: t('categories.vehicles', 'Véhicules') },
                { to: '/category/electronique', label: t('categories.electronics', 'Électronique') },
                { to: '/category/services', label: t('categories.services', 'Services') },
                { to: '/category/artisanat', label: t('categories.artisanat', 'Artisanat') }
              ].map((category, index) => (
                <li key={index} className="transform transition-transform group">
                  <Link to={category.to} className="text-gray-600 group-hover:text-blue-600 transition-colors flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform">{category.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact with improved styling */}
          <div>
            <h3 className="font-bold text-gray-900 mb-5 text-lg">{t('footer.contact', 'Contact')}</h3>
            <ul className="space-y-5">
              <li className="flex items-center gap-3 group">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Mail className="h-4 w-4" />
                </div>
                <a href="mailto:contact@goodeaal.com" className="text-gray-600 group-hover:text-blue-600 transition-colors">
                  contact@goodeaal.com
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Phone className="h-4 w-4" />
                </div>
                <a href="tel:+212500000000" className="text-gray-600 group-hover:text-blue-600 transition-colors">
                  +212 5 00 00 00 00
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all flex-shrink-0 mt-1">
                  <MapPin className="h-4 w-4" />
                </div>
                <address className="not-italic text-gray-600 group-hover:text-gray-800 transition-colors">
                  {t('footer.address', '123 Boulevard Mohammed V, Casablanca, Maroc')}
                </address>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom area with app links */}
        <div className="mb-8 py-6 border-y border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-medium text-gray-800 mb-2 text-center md:text-left">
                {t('footer.downloadApp', 'Téléchargez notre application')}
              </p>
              <p className="text-gray-600 text-sm text-center md:text-left">
                {t('footer.appPromo', 'Accédez à GoodDeal où que vous soyez')}
              </p>
            </div>

            <div className="flex gap-4">
              <a
                href="#"
                className="transition-transform hover:scale-105 hover:shadow-md rounded-xl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://eczqxyibzosgaktrmozt.supabase.co/storage/v1/object/public/assets/app-store-badge.svg"
                  alt="App Store"
                  className="h-10"
                />
              </a>
              <a
                href="#"
                className="transition-transform hover:scale-105 hover:shadow-md rounded-xl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://eczqxyibzosgaktrmozt.supabase.co/storage/v1/object/public/assets/google-play-badge.svg"
                  alt="Google Play"
                  className="h-10"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright and links */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} GoodDeal. {t('footer.copyright', 'Tous droits réservés.')}
          </p>

          {/* Legal links with dividers */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              { to: '/privacy', label: t('footer.legal.privacy', 'Politique de confidentialité') },
              { to: '/terms', label: t('footer.legal.terms', 'Conditions d\'utilisation') },
              { to: '/legal', label: t('footer.legal.legal', 'Mentions légales') }
            ].map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/admin"
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Shield className="h-4 w-4" />
              {t('footer.legal.admin', 'Administration')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}