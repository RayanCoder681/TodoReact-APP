// @ts-no-check

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { FirebaseError } from "firebase/app";
import { motion } from "framer-motion";
import { LogIn, UserPlus, AlertCircle } from "lucide-react";

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
    <div className="flex justify-center items-center min-h-screen px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-panel card w-full max-w-sm shadow-2xl overflow-hidden"
      >
        <div className="card-body p-8">
          <motion.div
            key={isSignUp ? "signup" : "signin"}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-2 mb-4"
          >
            <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400">
              {isSignUp ? "Créer un compte" : "Connexion"}
            </h2>
            <p className="text-center text-gray-400 text-sm">
              {isSignUp ? "Rejoignez-nous pour gérer vos tâches" : "Heureux de vous revoir !"}
            </p>
          </motion.div>

          <div className="form-control">
            <label htmlFor="email-input" className="label">
              <span className="label-text text-gray-300">Email</span>
            </label>
            <input
              id="email-input"
              type="email"
              placeholder="exemple@email.com"
              className="input glass-input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-control mt-4">
            <label htmlFor="password-input" className="label">
              <span className="label-text text-gray-300">Mot de passe</span>
            </label>
            <input
              id="password-input"
              type="password"
              placeholder="••••••••"
              className="input glass-input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="alert alert-error mt-4 text-sm py-2"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="form-control mt-8 gap-3">
            <button
              onClick={handleAuth}
              className="btn btn-primary w-full shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  S'inscrire
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Se connecter
                </>
              )}
            </button>

            <div className="divider text-xs text-gray-500 my-1">OU</div>

            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="btn btn-ghost btn-sm w-full text-gray-400 hover:text-white"
              disabled={loading}
              type="button"
            >
              {isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};