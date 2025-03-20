import { useEffect } from "react";
import { testSupabaseConnection } from "../src/lib/supabase";

const TestSupabase = () => {
    useEffect(() => {
        testSupabaseConnection()
            .then((result) => console.log("✅ Connexion réussie :", result))
            .catch((error) => console.error("❌ Erreur de connexion :", error));
    }, []);

    return <div>Test de connexion à Supabase...</div>;
};
export async function testFetchSignup() {
    try {
        const response = await fetch("https://eczqxyibzosgaktrmozt.supabase.co/auth/v1/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
                email: "dmutaka7@gmail.com",
                password: "Danmutaka@5",
            }),
        });

        //const result = await response.json();
        //console.log("📡 Réponse API Supabase :", result);
    } catch (error) {
        console.error("❌ Erreur fetch signup :", error);
    }
}

export default testFetchSignup;
