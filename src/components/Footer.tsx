import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo and description */}
          <div className="space-y-4">
            <Logo />
            <p className="text-gray-600 text-sm">
              {t('footer.description')}
            </p>
            {/* Social media */}
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/create-listing" className="text-gray-600 hover:text-primary transition-colors">
                  {t('footer.postListing')}
                </Link>
              </li>
              <li>
                <Link to="/requests" className="text-gray-600 hover:text-primary transition-colors">
                  {t('footer.requests')}
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-gray-600 hover:text-primary transition-colors">
                  {t('footer.safety')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-primary transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('footer.categories')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/immobilier" className="text-gray-600 hover:text-primary transition-colors">
                  {t('categories.realEstate')}
                </Link>
              </li>
              <li>
                <Link to="/category/vehicules" className="text-gray-600 hover:text-primary transition-colors">
                  {t('categories.vehicles')}
                </Link>
              </li>
              <li>
                <Link to="/category/electronique" className="text-gray-600 hover:text-primary transition-colors">
                  {t('categories.electronics')}
                </Link>
              </li>
              <li>
                <Link to="/category/services" className="text-gray-600 hover:text-primary transition-colors">
                  {t('categories.services')}
                </Link>
              </li>
              <li>
                <Link to="/category/artisanat" className="text-gray-600 hover:text-primary transition-colors">
                  {t('categories.artisanat')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-2 text-gray-600">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:contact@goodeaal.com" className="hover:text-primary transition-colors">
                  contact@goodeaal.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Phone className="h-5 w-5 text-primary" />
                <a href="tel:+212500000000" className="hover:text-primary transition-colors">
                  +212 5 00 00 00 00
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <address className="not-italic">
                  {t('footer.address')}
                </address>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-gray-600 text-sm text-center md:text-left">
              {t('footer.copyright').replace('{year}', currentYear.toString())}
            </p>
            
            {/* Legal links and admin */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/privacy" className="text-gray-600 hover:text-primary transition-colors">
                {t('footer.legal.privacy')}
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-primary transition-colors">
                {t('footer.legal.terms')}
              </Link>
              <Link to="/legal" className="text-gray-600 hover:text-primary transition-colors">
                {t('footer.legal.legal')}
              </Link>
              <Link 
                to="/admin" 
                className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors"
              >
                <Shield className="h-4 w-4" />
                {t('footer.legal.admin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}