import React from 'react';
import { Link } from 'react-router-dom';

const LOGO_URL = 'https://firebasestorage.googleapis.com/v0/b/goodeaal-404fa.firebasestorage.app/o/goodeaal-logo.png?alt=media&token=74449f3c-831e-4433-a3c1-77e724d96f08';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center">
      <img 
        src={LOGO_URL}
        alt="Goodeaal" 
        className="h-8 sm:h-10 md:h-12 w-auto object-contain" // Taille responsive
      />
    </Link>
  );
}