import React, { useState } from 'react';
import axios from 'axios';

const Test = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const signUpNewUser = async () => {
        try {
            // Envoi de la requête avec Axios, inclure la clé API dans l'en-tête
            const response = await axios.post(
                'https://eczqxyibzosgaktrmozt.supabase.co/auth/v1/signup',
                {
                    email: email,
                    password: password,
                    options: {
                        // Exemple d'option, tu peux ajuster
                        // emailRedirectTo: 'http://localhost:5173/admin',
                    },
                },
                {
                    timeout: 50000, // Timeout de 20 secondes
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjenF4eWliem9zZ2FrdHJtb3p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjQ1MDMsImV4cCI6MjA1NTQwMDUwM30.C1oLmPvBx9pNOIZSsEKTRyS8vU-x55PA4fUpjrlaoJQ', // Remplace par ta clé publique
                    },
                }
            );

            // Afficher la réponse si l'inscription réussit
            console.log('Utilisateur inscrit avec succès :', response.data);
            setMessage('Utilisateur inscrit avec succès !');
        } catch (error) {
            // Gestion de l'erreur
            console.error('Erreur lors de l\'inscription :', error);

            // Vérifier si une erreur est spécifique à la requête
            /*
            if (error.response) {
                setMessage(`Erreur HTTP: ${error.response.status}`);
            } else if (error.code === 'ECONNABORTED') {
                setMessage('Le délai de la requête a expiré.');
            } else {
                setMessage(`Erreur inconnue : ${error.message}`);
            }*/
        }
    };

    return (
        <div>
            <h1>Inscription</h1>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={signUpNewUser}>S'inscrire</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Test;
