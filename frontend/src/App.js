import React, { useState, useRef } from "react";
import { ethers } from "ethers";
import { Plane, Shield, Clock, User, History, Home, CheckCircle, Globe, Star } from "lucide-react";


import AchatBillet from "./AchatBillet";
import Paiement from "./Paiement";
import SimulationRetard from "./SimulationRetard";
import Historique from "./Historique";
import { getContract, contractAddress } from "./contract";
import "./App.css";


const AchatBilletWrapper = ({ onAchatSubmit, contract }) => (
  <div className="bg-white rounded-xl shadow-lg p-8">
    <div className="flex items-center gap-3 mb-6">
      <Plane className="text-blue-600" size={28} />
      <h2 className="text-2xl font-bold text-gray-800">Souscrire une Assurance Vol</h2>
    </div>
    <AchatBillet onAchatSubmit={onAchatSubmit} contract={contract} />
  </div>
);

const PaiementWrapper = ({ detailsBillet, contract, onPaiementReussi, onRetour }) => (
  <div className="bg-white rounded-xl shadow-lg p-8">
    <div className="flex items-center gap-3 mb-6">
      <Shield className="text-green-600" size={28} />
      <h2 className="text-2xl font-bold text-gray-800">Finaliser le Paiement</h2>
    </div>
    <Paiement 
      detailsBillet={detailsBillet}
      contract={contract}
      onPaiementReussi={onPaiementReussi}
      onRetour={onRetour}
    />
  </div>
);

const SimulationRetardWrapper = ({ detailsBillet, onTermine, contract, onSimulationReussie }) => (
  <div className="bg-white rounded-xl shadow-lg p-8">
    <div className="flex items-center gap-3 mb-6">
      <Clock className="text-orange-600" size={28} />
      <h2 className="text-2xl font-bold text-gray-800">Simulation de Retard</h2>
    </div>
    <SimulationRetard 
      detailsBillet={detailsBillet}
      onTermine={onTermine}
      contract={contract}
      onSimulationReussie={onSimulationReussie}
    />
  </div>
);

const HistoriqueWrapper = React.forwardRef(({ billets, onSimuler, contract, onRefresh }, ref) => (
  <div className="bg-white rounded-xl shadow-lg p-8">
    <div className="flex items-center gap-3 mb-6">
      <History className="text-purple-600" size={28} />
      <h2 className="text-2xl font-bold text-gray-800">Historique des Billets</h2>
    </div>
    <Historique 
      ref={ref}
      billets={billets} 
      onSimuler={onSimuler} 
      contract={contract}
      onRefresh={onRefresh}
    />
  </div>
));

// Page d'accueil 
const HomePage = ({ onNavigate, account, onConnectWallet }) => (
  <div className="min-h-screen bg-gradient-blue">
    {/* Hero Section */}
    <div className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '50%' }}>
              <Shield size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6">
            AéroChain
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-blue-100">
            Protégez-vous contre les retards de vol avec notre assurance intelligente basée sur la blockchain. 
            Remboursement automatique et transparent.
          </p>
          <div className="flex flex-col gap-4 justify-center" style={{ alignItems: 'center' }}>
            <button 
              onClick={() => onNavigate('achat')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              Souscrire une Assurance
            </button>
            <button 
              onClick={onConnectWallet}
              className="text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200"
              style={{ border: '2px solid white', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              {account ? `Connecté: ${account.slice(0, 6)}...` : "Connecter Wallet"}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Features Section */}
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Pourquoi choisir AéroChain ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une protection complète et innovante pour tous vos voyages
          </p>
        </div>
        
        <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="feature-card">
            <div className="feature-icon bg-blue-600">
              <Clock size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Remboursement Rapide
            </h3>
            <p className="text-gray-600">
              Recevez votre compensation automatiquement en cas de retard, sans paperasserie.
            </p>
          </div>

          <div className="feature-card green">
            <div className="feature-icon bg-green-600">
              <Shield size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              100% Sécurisé
            </h3>
            <p className="text-gray-600">
              Technologie blockchain pour une transparence et une sécurité maximales.
            </p>
          </div>

          <div className="feature-card purple">
            <div className="feature-icon bg-purple-600">
              <Globe size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Couverture Mondiale
            </h3>
            <p className="text-gray-600">
              Protection valable sur tous les vols commerciaux dans le monde entier.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Stats Section */}
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="stats-grid">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
            <div className="text-gray-600">Voyageurs Protégés</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">€2.5M</div>
            <div className="text-gray-600">Remboursements Effectués</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600 mb-2">15min</div>
            <div className="text-gray-600">Temps Moyen de Traitement</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction Client</div>
          </div>
        </div>
      </div>
    </div>

    {/* CTA Section */}
    <div className="py-20 hero-section">
      <div className="max-w-4xl mx-auto text-center px-6">
        <h2 className="text-4xl font-bold mb-6 text-white">
          Prêt à voyager en toute sérénité ?
        </h2>
        <p className="text-xl mb-8 text-blue-100">
          Rejoignez des milliers de voyageurs qui font confiance à AéroChain
        </p>
        <button 
          onClick={() => onNavigate('achat')}
          className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg"
          style={{ border: 'none', cursor: 'pointer' }}
        >
          Commencer Maintenant
        </button>
      </div>
    </div>
  </div>
);

function App() {
  const [vueActuelle, setVueActuelle] = useState("home");
  const [vuePrecedente, setVuePrecedente] = useState("home");
  const [billetActif, setBilletActif] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [forceRefreshHistorique, setForceRefreshHistorique] = useState(0);

  // Référence pour l'historique
  const historiqueRef = useRef(null);

  // ==========================
  // Connexion Wallet Client
  // ==========================
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Installez MetaMask !");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const clientAccount = accounts[0];
      setAccount(clientAccount);
      console.log("Compte connecté :", clientAccount);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const c = getContract(signer);
      setContract(c);
      console.log("Contract chargé :", contractAddress);
    } catch (err) {
      console.error("Erreur connexion wallet :", err);
      alert("Connexion échouée");
    }
  };

  // ==========================
  // Achat billet
  // ==========================
  const handleAchat = async ({ dureeVol, prixEur }) => {
    if (!contract) {
      alert("Connectez votre wallet avant d'acheter !");
      return;
    }

    try {
      console.log("Souscription pour :", dureeVol, "heures,", prixEur, "EUR");

      const tx = await contract.souscrireAssurance(dureeVol, prixEur);
      await tx.wait();

      const compteur = await contract.compteurBillets();
      const id = compteur.toString();

      const billet = await contract.getBillet(id);
      console.log("Billet créé :", billet);

      setBilletActif({ id, prixEur, dureeVol, ...billet });
      setVueActuelle("paiement");
    } catch (err) {
      console.error("Erreur souscription :", err);
      alert(
        "Erreur lors de la souscription : " +
          (err?.reason || err?.data?.message || err.message)
      );
    }
  };

  // ==========================
  // Paiement billet
  // ==========================
  const handlePaiementReussi = async () => {
    if (!billetActif || !contract) {
      console.error("Pas de billet actif ou contract pour finaliser le paiement");
      return;
    }

    try {
      const billetMisAJour = await contract.getBillet(billetActif.id);
      
      const billetComplet = {
        id: billetActif.id,
        prixEur: billetActif.prixEur,
        dureeVol: billetActif.dureeVol,
        ...billetMisAJour,
        datePaiement: new Date().toISOString()
      };

      console.log("Billet après paiement :", billetComplet);

      setBilletActif(billetComplet);
      setHistorique(prev => [...prev, billetComplet]);
      setVueActuelle("simulation");
      
      console.log("✅ Paiement finalisé, navigation vers simulation");
    } catch (err) {
      console.error("Erreur lors de la finalisation du paiement :", err);
      alert("Paiement effectué mais erreur lors de la mise à jour. Vérifiez l'historique.");
    }
  };

  // ==========================
  // Simulation depuis historique
  // ==========================
  const simulerDepuisHistorique = (billet) => {
    console.log("Simulation depuis historique pour billet :", billet);
    setBilletActif(billet);
    setVuePrecedente("historique");
    setVueActuelle("simulation");
  };

  // ==========================
  // Callback après simulation réussie
  // ==========================
  const handleSimulationReussie = async (billetId) => {
    console.log("🎯 Simulation réussie pour le billet #", billetId);
    
    // Forcer le rafraîchissement de l'historique
    setForceRefreshHistorique(prev => prev + 1);
    
    // Optionnellement, mettre à jour le billet actif avec le statut le plus récent
    if (contract && billetActif && billetActif.id == billetId) {
      try {
        const billetMisAJour = await contract.getBillet(billetId);
        setBilletActif(prev => ({
          ...prev,
          statut: billetMisAJour["4"] // Nouveau statut depuis le contract
        }));
        console.log("✅ Billet actif mis à jour avec le nouveau statut");
      } catch (err) {
        console.warn("Erreur mise à jour billet actif:", err);
      }
    }
  };

  // ==========================
  // Fin de simulation
  // ==========================
  const handleSimulationTerminee = () => {
    console.log("Simulation terminée, retour à :", vuePrecedente);
    setBilletActif(null);
    setVueActuelle(vuePrecedente === "achat" ? "home" : vuePrecedente);
    setVuePrecedente("home");
  };

  // ==========================
  // Callback de rafraîchissement de l'historique
  // ==========================
  const handleHistoriqueRefresh = (nouveauxBillets) => {
    console.log("📋 Historique rafraîchi avec", nouveauxBillets.length, "billets");
    // Optionnellement, mettre à jour l'état local de l'historique
    // setHistorique(nouveauxBillets); // Décommentez si vous voulez synchroniser
  };

  // ==========================
  // Navigation
  // ==========================
  const naviguerVers = (vue) => {
    console.log("Navigation vers :", vue);
    setBilletActif(null);
    setVueActuelle(vue);
    setVuePrecedente(vue);
  };

  // Navigation moderne avec navbar
  const renderNavbar = () => {
    if (vueActuelle === "home") return null;
    
    return (
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-content">
            <div className="nav-brand">
              <Shield className="text-blue-600" size={32} />
              <span className="font-bold text-xl text-gray-800">AéroChain</span>
            </div>
            
            <div className="nav-menu">
              <button 
                onClick={() => naviguerVers("home")}
                className={`nav-button ${vueActuelle === "home" ? "active" : ""}`}
              >
                <Home size={20} />
                Accueil
              </button>
              
              <button 
                onClick={() => naviguerVers("achat")}
                className={`nav-button ${vueActuelle === "achat" ? "active" : ""}`}
              >
                <Plane size={20} />
                Nouvelle Assurance
              </button>
              
              <button 
                onClick={() => naviguerVers("historique")}
                className={`nav-button ${vueActuelle === "historique" ? "active" : ""}`}
              >
                <History size={20} />
                Historique
              </button>

              <div className="nav-divider"></div>
              
              <button 
                onClick={connectWallet}
                className="wallet-button"
              >
                <User size={20} />
                {account ? `${account.slice(0, 6)}...` : "Connecter"}
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavbar()}
      
      {vueActuelle === "home" && (
        <HomePage 
          onNavigate={naviguerVers}
          account={account}
          onConnectWallet={connectWallet}
        />
      )}

      {vueActuelle !== "home" && (
        <main className="max-w-4xl mx-auto px-6 py-8">
          {vueActuelle === "achat" && (
            <AchatBilletWrapper onAchatSubmit={handleAchat} contract={contract} />
          )}

          {vueActuelle === "paiement" && (
            <PaiementWrapper
              detailsBillet={billetActif}
              contract={contract}
              onPaiementReussi={handlePaiementReussi}
              onRetour={() => naviguerVers("achat")}
            />
          )}

          {vueActuelle === "simulation" && billetActif && (
            <SimulationRetardWrapper
              detailsBillet={billetActif}
              onTermine={handleSimulationTerminee}
              contract={contract}
              onSimulationReussie={handleSimulationReussie}
            />
          )}

          {vueActuelle === "simulation" && !billetActif && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#DC2626' }}>⚠ Erreur</h2>
              <p className="text-gray-600 mb-6">Aucun billet sélectionné pour la simulation.</p>
              <button 
                onClick={() => naviguerVers("home")} 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                style={{ border: 'none', cursor: 'pointer' }}
              >
                ← Retour à l'accueil
              </button>
            </div>
          )}

          {vueActuelle === "historique" && (
            <HistoriqueWrapper
              ref={historiqueRef}
              billets={historique}
              onSimuler={simulerDepuisHistorique}
              contract={contract}
              onRefresh={handleHistoriqueRefresh}
              key={forceRefreshHistorique} // Force le re-render de l'historique
            />
          )}
        </main>
      )}

      {/* Footer pour les pages internes */}
      {vueActuelle !== "home" && (
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="text-blue-600" size={24} />
                <span className="font-bold text-gray-800">AéroChain</span>
              </div>
              <p className="text-gray-500 text-sm">
                © 2025 AéroChain. Protection blockchain pour vos voyages.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;