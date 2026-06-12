"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleContinue = async () => {
    setIsLoading(true);
    setError("");
    try {
      router.push("/login");
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left side - Welcome */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="text-3xl font-bold text-indigo-600">Gestion de Stock</div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Bienvenue !</h1>
          <p className="text-gray-600 text-center mb-8">Cliquez sur continuer pour accéder à votre tableau de bord.</p>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="flex items-center justify-center w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all duration-200 mb-4"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />
              </svg>
            )}
            {isLoading ? "Redirection..." : "Continuer"}
          </button>
        </div>
      </div>

      {/* Right side - Info (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 text-white">
        <div className="flex flex-col justify-center items-center w-full p-12">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-6">Gestion de stock moderne</h2>
            <p className="text-indigo-100 mb-8">
              Suivez, mettez à jour et gérez facilement votre stock avec un tableau de bord intuitif.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Mises à jour en temps réel</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Édition facile des articles</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Analytique visuelle</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Support multi-utilisateur</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
