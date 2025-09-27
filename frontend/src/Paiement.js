
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

function Paiement({ detailsBillet, contract, onPaiementReussi, onRetour }) {
  const [vendeur, setVendeur] = useState("");
  const [prixETH, setPrixETH] = useState("0");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [statutBillet, setStatutBillet] = useState(null);
  const [statutTexte, setStatutTexte] = useState("");
  const [acheteurBillet, setAcheteurBillet] = useState("");
  const [utilisateurActuel, setUtilisateurActuel] = useState("");

  const getStatutTexte = (statutNum) => {
    switch(Number(statutNum)) {
      case 0: return "Disponible";
      case 1: return "Assuré";
      case 2: return "Terminé";
      case 3: return "Remboursé";
      default: return "Inconnu";
    }
  };

  const getStatutEmoji = (statutNum) => {
    switch(Number(statutNum)) {
      case 0: return "⏳ Disponible (en attente de paiement)";
      case 1: return "✅ Assuré";
      case 2: return "🏁 Terminé";
      case 3: return "💰 Remboursé";
      default: return "❓ Statut inconnu";
    }
  };

  const getStatutStyle = (statutNum) => {
    switch(Number(statutNum)) {
      case 0: return {
        backgroundColor: '#fff3cd',
        borderColor: '#ffeaa7',
        textColor: '#856404',
        icon: '⏳'
      };
      case 1: return {
        backgroundColor: '#d1f2eb',
        borderColor: '#a7f3d0',
        textColor: '#065f46',
        icon: '✅'
      };
      case 2: return {
        backgroundColor: '#e1f5fe',
        borderColor: '#81d4fa',
        textColor: '#0277bd',
        icon: '🏁'
      };
      case 3: return {
        backgroundColor: '#f3e5f5',
        borderColor: '#ce93d8',
        textColor: '#6a1b9a',
        icon: '💰'
      };
      default: return {
        backgroundColor: '#f5f5f5',
        borderColor: '#e0e0e0',
        textColor: '#757575',
        icon: '❓'
      };
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!contract || !detailsBillet) return;

      try {
        // Récupérer l'adresse du propriétaire du contract
        const proprietaire = await contract.proprietaire();
        setVendeur(proprietaire);

        // Récupérer l'adresse de l'utilisateur connecté
        let adresseUtilisateur = "";
        try {
          if (contract.signer && typeof contract.signer.getAddress === 'function') {
            adresseUtilisateur = await contract.signer.getAddress();
          } else if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            adresseUtilisateur = accounts[0] || "";
          }
        } catch (err) {
          console.warn("Impossible de récupérer l'adresse utilisateur:", err);
        }
        setUtilisateurActuel(adresseUtilisateur);

        // Récupérer les informations complètes du billet
        // Vérifier si detailsBillet contient déjà les données ou s'il faut les récupérer
        let billetInfo;
        
        if (detailsBillet["0"] !== undefined) {
          // Les données sont déjà dans le format de retour du contract
          console.log("Utilisation des données détails existantes");
          billetInfo = {
            id: detailsBillet.id || detailsBillet["0"],
            acheteur: detailsBillet["1"],
            prixEnWei: detailsBillet["2"],
            dureeVol: detailsBillet["3"], 
            statut: detailsBillet["4"]
          };
        } else {
          // Récupérer depuis le contract
          console.log("Récupération depuis le contract");
          billetInfo = await contract.getBillet(detailsBillet.id);
        }
        
        console.log("=== INFORMATIONS BILLET COMPLÈTES ===");
        console.log("Billet ID:", detailsBillet.id);
        console.log("Infos complètes:", billetInfo);
        console.log("Prix en Wei:", billetInfo.prixEnWei ? billetInfo.prixEnWei.toString() : "N/A");
        console.log("Durée vol:", billetInfo.dureeVol ? billetInfo.dureeVol.toString() : "N/A");
        console.log("Statut (numérique):", billetInfo.statut);
        console.log("Acheteur du billet:", billetInfo.acheteur);
        console.log("Utilisateur connecté:", adresseUtilisateur);
        
        if (billetInfo.acheteur && adresseUtilisateur) {
          console.log("Adresses correspondent:", billetInfo.acheteur.toLowerCase() === adresseUtilisateur.toLowerCase());
        }

        // Convertir le prix en ETH pour affichage
        let prixEnETH = "0";
        if (billetInfo.prixEnWei) {
          try {
            prixEnETH = ethers.formatEther(billetInfo.prixEnWei);
          } catch (err) {
            console.warn("Erreur conversion prix:", err);
            prixEnETH = "Erreur conversion";
          }
        }
        setPrixETH(prixEnETH);

        // Définir le statut (gérer le cas où statut pourrait être undefined)
        const statutNum = billetInfo.statut !== undefined ? Number(billetInfo.statut) : null;
        setStatutBillet(statutNum);
        setStatutTexte(statutNum !== null ? getStatutTexte(statutNum) : "Inconnu");
        setAcheteurBillet(billetInfo.acheteur || "");

        // Vérifier si l'utilisateur est bien l'acheteur
        if (billetInfo.acheteur && adresseUtilisateur && 
            billetInfo.acheteur.toLowerCase() !== adresseUtilisateur.toLowerCase()) {
          setErreur(`❌ Vous n'êtes pas l'acheteur de ce billet. 
                    Votre adresse: ${adresseUtilisateur}`);
        } else if (!adresseUtilisateur) {
          setErreur("❌ Impossible de récupérer votre adresse wallet. Reconnectez votre wallet.");
        }

      } catch (err) {
        console.error("Erreur initialisation Paiement :", err);
        setErreur("Erreur lors du chargement des informations du billet: " + err.message);
      }
    };

    init();
  }, [contract, detailsBillet]);

  const handlePaiement = async () => {
    if (!contract || !detailsBillet) {
      alert("Connectez votre wallet pour effectuer le paiement !");
      return;
    }

    try {
      setLoading(true);
      setErreur("");

      // Vérifications préalables
      let billetInfo;
      let adresseUtilisateur = "";

      // Récupérer l'adresse utilisateur
      try {
        if (contract.signer && typeof contract.signer.getAddress === 'function') {
          adresseUtilisateur = await contract.signer.getAddress();
        } else if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          adresseUtilisateur = accounts[0] || "";
        }
      } catch (err) {
        throw new Error("Impossible de récupérer votre adresse wallet");
      }

      // Récupérer les infos du billet
      if (detailsBillet["0"] !== undefined) {
        billetInfo = {
          id: detailsBillet.id || detailsBillet["0"],
          acheteur: detailsBillet["1"],
          prixEnWei: detailsBillet["2"],
          dureeVol: detailsBillet["3"], 
          statut: detailsBillet["4"]
        };
      } else {
        billetInfo = await contract.getBillet(detailsBillet.id);
      }

      console.log("=== TENTATIVE DE PAIEMENT ===");
      console.log("ID du billet :", detailsBillet.id);
      console.log("Prix à payer (Wei):", billetInfo.prixEnWei.toString());
      console.log("Prix à payer (ETH):", ethers.formatEther(billetInfo.prixEnWei));
      console.log("Statut actuel:", billetInfo.statut, "(" + getStatutTexte(billetInfo.statut) + ")");
      console.log("Acheteur:", billetInfo.acheteur);
      console.log("Utilisateur:", adresseUtilisateur);

      // Vérifier que le billet existe
      if (billetInfo.id === 0) {
        throw new Error("Ce billet n'existe pas");
      }

      // Vérifier que l'utilisateur est bien l'acheteur
      if (billetInfo.acheteur.toLowerCase() !== adresseUtilisateur.toLowerCase()) {
        throw new Error("Vous n'êtes pas l'acheteur de ce billet. Seul l'acheteur original peut payer.");
      }

      // Vérifier le statut
      if (Number(billetInfo.statut) !== 0) {
        const statutActuel = getStatutTexte(billetInfo.statut);
        throw new Error(`Le billet n'est pas en attente de paiement. Statut actuel: ${statutActuel}`);
      }

      // Effectuer le paiement
      const tx = await contract.payerBillet(detailsBillet.id, {
        value: billetInfo.prixEnWei,
        gasLimit: 300000
      });
      
      console.log("Transaction envoyée, hash :", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmée :", receipt);

      console.log("✅ Paiement réussi ! Assurance activée.");
      onPaiementReussi();
      
    } catch (err) {
      console.error("❌ Erreur paiement :", err);
      
      let messageErreur = "Erreur inconnue";
      
      // Gestion des erreurs du smart contract
      if (err?.reason) {
        messageErreur = err.reason;
      } else if (err?.data?.message) {
        messageErreur = err.data.message;
      } else if (err?.message) {
        messageErreur = err.message;
      }
      
      // Messages d'erreur traduits et explicites
      if (messageErreur.includes("Ce billet n'existe pas")) {
        messageErreur = "❌ Le billet #" + detailsBillet.id + " n'existe pas";
      } else if (messageErreur.includes("Vous n'etes pas l'acheteur")) {
        messageErreur = "❌ Seul l'acheteur original peut payer ce billet";
      } else if (messageErreur.includes("Le billet n'est pas en attente de paiement")) {
        messageErreur = "❌ Le billet n'est pas dans l'état 'Disponible'";
      } else if (messageErreur.includes("Le montant envoye ne correspond pas")) {
        messageErreur = "❌ Le montant envoyé ne correspond pas au prix du billet";
      } else if (messageErreur.includes("insufficient funds")) {
        messageErreur = "❌ Fonds insuffisants dans votre wallet";
      } else if (messageErreur.includes("user rejected")) {
        messageErreur = "❌ Transaction annulée par l'utilisateur";
      }
      
      setErreur(messageErreur);
    } finally {
      setLoading(false);
    }
  };

  if (!detailsBillet) return null;

  const peutPayer = statutBillet === 0 && 
                   acheteurBillet.toLowerCase() === utilisateurActuel.toLowerCase() &&
                   !loading;

  const statutStyle = getStatutStyle(statutBillet);

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Paiement
        </h1>
        <p style={{
          fontSize: '16px',
          opacity: '0.9',
          margin: '0',
          fontWeight: '300'
        }}>
          Confirmation et paiement de votre protection vol
        </p>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '8px 16px',
          display: 'inline-block',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Étape 2/3
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Détails du billet */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '2px solid #f1f5f9'
          }}>
            <div style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              padding: '8px',
              marginRight: '12px'
            }}>
              🎫
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0',
              color: '#1e293b'
            }}>
              Détails du Billet
            </h2>
          </div>

          <div style={{ space: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>Numéro de billet</span>
              <span style={{
                backgroundColor: '#f1f5f9',
                padding: '4px 12px',
                borderRadius: '20px',
                fontWeight: '600',
                color: '#1e293b'
              }}>
                #{detailsBillet.id}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>Durée du vol</span>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>
                {detailsBillet.dureeVol} heures
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>Prix du billet</span>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>
                {detailsBillet.prixEur} €
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0 8px 0'
            }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>Prix assurance</span>
              <div style={{
                backgroundColor: '#dbeafe',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '2px solid #3b82f6'
              }}>
                <span style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1d4ed8'
                }}>
                  {prixETH} ETH
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statut et vérification */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '2px solid #f1f5f9'
          }}>
            <div style={{
              backgroundColor: '#10b981',
              color: 'white',
              borderRadius: '8px',
              padding: '8px',
              marginRight: '12px'
            }}>
              🔍
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0',
              color: '#1e293b'
            }}>
              Vérification
            </h2>
          </div>

          {/* Statut du billet */}
          <div style={{
            backgroundColor: statutStyle.backgroundColor,
            border: `2px solid ${statutStyle.borderColor}`,
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {statutStyle.icon}
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: statutStyle.textColor,
              marginBottom: '4px'
            }}>
              {statutTexte}
            </div>
            <div style={{
              fontSize: '12px',
              color: statutStyle.textColor,
              opacity: '0.8'
            }}>
              {getStatutEmoji(statutBillet)}
            </div>
          </div>

          {/* Détails techniques (réduits) */}
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            
            <div>
              <strong>Votre adresse :</strong>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '4px 8px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                marginTop: '4px'
              }}>
                {utilisateurActuel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages de statut */}
      {erreur && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          color: '#dc2626'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            <div style={{ fontSize: '20px', marginRight: '12px', marginTop: '2px' }}>⚠️</div>
            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
              {erreur}
            </div>
          </div>
        </div>
      )}

      {statutBillet === 1 && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          color: '#166534'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '24px', marginRight: '12px' }}>✅</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                Assurance active !
              </div>
              <div style={{ fontSize: '14px', opacity: '0.8' }}>
                Ce billet a été payé et votre assurance vol est maintenant en cours de protection.
              </div>
            </div>
          </div>
        </div>
      )}

      {statutBillet === 2 && (
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          color: '#0369a1'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '24px', marginRight: '12px' }}>🏁</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                Vol terminé
              </div>
              <div style={{ fontSize: '14px', opacity: '0.8' }}>
                L'assurance de ce billet est arrivée à son terme.
              </div>
            </div>
          </div>
        </div>
      )}

      {statutBillet === 3 && (
        <div style={{
          backgroundColor: '#fdf4ff',
          border: '1px solid #e9d5ff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          color: '#7c3aed'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '24px', marginRight: '12px' }}>💰</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                Remboursement effectué
              </div>
              <div style={{ fontSize: '14px', opacity: '0.8' }}>
                Ce billet a été remboursé suite à un retard significatif de votre vol.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <button 
          onClick={onRetour}
          style={{
            flex: '1',
            padding: '16px 24px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            backgroundColor: 'white',
            color: '#64748b',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f8fafc';
            e.target.style.borderColor = '#cbd5e1';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.borderColor = '#e2e8f0';
          }}
        >
          ← Retour
        </button>

        <button 
          onClick={handlePaiement}
          disabled={!peutPayer}
          style={{
            flex: '2',
            padding: '16px 24px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '12px',
            border: 'none',
            background: peutPayer 
              ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
              : '#e2e8f0',
            color: peutPayer ? 'white' : '#94a3b8',
            cursor: peutPayer ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: peutPayer ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none'
          }}
          onMouseOver={(e) => {
            if (peutPayer) {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.5)';
            }
          }}
          onMouseOut={(e) => {
            if (peutPayer) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Traitement...
            </>
          ) : (
            <>💳 Payer l'Assurance</>
          )}
        </button>
      </div>

      

      

      {/* CSS pour l'animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          details[open] summary {
            margin-bottom: 16px;
          }
          
          details summary::marker {
            color: #3b82f6;
          }
          
          details summary::-webkit-details-marker {
            color: #3b82f6;
          }
        `}
      </style>
    </div>
  );
}

export default Paiement;