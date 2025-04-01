// pages/auth/callback.tsx
import { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
    const router = useRoutes();

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                await router.push('/');
            }
        });
    }, []);

    return <div>Redirection en cours...</div>;
}