import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { FirebaseError } from "firebase/app";
import "./LoginPage.css";

type Props = {
  onLoginSuccess: (userId: string) => void;
};

// Fonction pour traduire les erreurs Firebase
const getErrorMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    "auth/email-already-in-use": "Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.",
    "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
    "auth/invalid-email": "L'email saisi n'est pas valide.",
    "auth/user-not-found": "Aucun compte trouvé avec cet email.",
    "auth/wrong-password": "Le mot de passe est incorrect.",
    "auth/too-many-requests": "Trop de tentatives échouées. Veuillez réessayer plus tard.",
    "auth/operation-not-allowed": "Cette opération n'est pas disponible.",
    "auth/invalid-credential": "Email ou mot de passe incorrect.",
  };

  return errorMessages[errorCode] || "Une erreur s'est produite. Veuillez réessayer.";
};

export const LoginPage = ({ onLoginSuccess }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setError("");
    
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Veuillez entrer un email valide");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        onLoginSuccess(result.user.uid);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess(result.user.uid);
      }
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(getErrorMessage(err.code));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue s'est produite");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <div className="animated-card card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">
            {isSignUp ? "Créer un compte" : "Connexion"}
          </h2>
          
          <label htmlFor="email-input" className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            id="email-input"
            type="email"
            placeholder="Votre email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          
          <label htmlFor="password-input" className="label">
            <span className="label-text">Mot de passe</span>
          </label>
          <input
            id="password-input"
            type="password"
            placeholder="Votre mot de passe"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          
          {error && (
            <div className="alert alert-error" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <button
            onClick={handleAuth}
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Chargement..." : isSignUp ? "S'inscrire" : "Se connecter"}
          </button>
          
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="btn btn-ghost w-full"
            disabled={loading}
            type="button"
          >
            {isSignUp ? "Déjà inscrit ?" : "Créer un compte"}
          </button>
        </div>
      </div>
    </div>
  );
};