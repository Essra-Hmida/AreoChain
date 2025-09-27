import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function SimulationRetard({ detailsBillet, onTermine, contract, onSimulationReussie }) {
  const [retard, setRetard] = useState('');
  const [messageRemboursement, setMessageRemboursement] = useState('');
  const [loading, setLoading] = useState(false);
  const [statutBillet, setStatutBillet] = useState(null);
  const [statutTexte, setStatutTexte] = useState("");

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
      case 0: return "⏳";
      case 1: return "🛡️";
      case 2: return "🏁";
      case 3: return "💰";
      default: return "❓";
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!contract || !detailsBillet) return;

      try {
        // Récupérer les informations complètes du billet
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
          console.log("Récupération depuis le contract pour billet ID:", detailsBillet.id);
          billetInfo = await contract.getBillet(detailsBillet.id);
        }
        
        console.log("=== INFORMATIONS BILLET SIMULATION ===");
        console.log("Billet ID:", detailsBillet.id);
        console.log("Infos complètes:", billetInfo);
        console.log("Statut brut:", billetInfo.statut);
        console.log("Statut converti:", Number(billetInfo.statut));

        // Définir le statut (gérer le cas où statut pourrait être undefined)
        const statutNum = billetInfo.statut !== undefined ? Number(billetInfo.statut) : null;
        setStatutBillet(statutNum);
        setStatutTexte(statutNum !== null ? getStatutTexte(statutNum) : "Inconnu");

      } catch (err) {
        console.error("Erreur initialisation SimulationRetard :", err);
        setStatutTexte("Erreur");
      }
    };

    init();
  }, [contract, detailsBillet]);

  if (!detailsBillet) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>❌</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1e293b',
            margin: '0 0 16px 0'
          }}>
            Erreur : Aucun billet sélectionné
          </h2>
          <button 
            onClick={onTermine}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              backgroundColor: 'white',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  const handleSimulation = async () => {
    const retardEnHeures = parseInt(retard, 10);

    if (isNaN(retardEnHeures) || retardEnHeures < 0) {
      setMessageRemboursement('❌ Veuillez entrer une valeur de retard valide.');
      return;
    }

    try {
      setLoading(true);
      
      if (!contract) {
        setMessageRemboursement("❌ Contrat non connecté.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      console.log("🔍 DEBUG - Avant transaction:");
      console.log("Retard entré:", retardEnHeures);
      console.log("Durée du vol:", detailsBillet.dureeVol);
      console.log("ID du billet:", detailsBillet.id);

      const tx = await contractWithSigner.constaterRetard(
        detailsBillet.id,
        retardEnHeures
      );
      
      console.log("⏳ Transaction envoyée, attente de confirmation...", tx.hash);
      await tx.wait();
      console.log("✅ Transaction confirmée !");

      const billetUpdated = await contract.getBillet(detailsBillet.id);
      
      console.log("🔍 DEBUG - Après transaction:");
      console.log("Billet mis à jour:", billetUpdated);
      console.log("Statut brut:", billetUpdated.statut);
      console.log("Statut converti:", Number(billetUpdated.statut));

      const statutFinal = Number(billetUpdated.statut);

      setStatutBillet(statutFinal);
      setStatutTexte(getStatutTexte(statutFinal));

      if (onSimulationReussie) {
        console.log("🔄 Appel du callback onSimulationReussie...");
        onSimulationReussie(detailsBillet.id);
      }

      if (statutFinal === 3) { // 3 = Remboursé
        setMessageRemboursement(
          `🎉 Félicitations ! Le retard (${retardEnHeures}h) est supérieur à la durée du vol (${detailsBillet.dureeVol}h).
           Vous avez été REMBOURSÉ de 50% sur la blockchain ✅`
        );
      } else if (statutFinal === 2) { // 2 = Terminé (pas de remboursement)
        setMessageRemboursement(
          `😞 Pas de remboursement : retard (${retardEnHeures}h) ≤ durée du vol (${detailsBillet.dureeVol}h).`
        );
      } else {
        // Cas imprévu
        setMessageRemboursement(
          `⚠️ Statut inattendu: ${statutFinal}. Vérifiez la transaction.`
        );
      }

    } catch (error) {
      console.error("❌ Erreur complète:", error);
      setMessageRemboursement("❌ Erreur lors de la transaction : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatutStyle = (statutNum) => {
    switch(Number(statutNum)) {
      case 0: // Disponible
        return { color: '#f59e0b', backgroundColor: '#fef3c7', icon: '⏳' };
      case 1: // Assuré
        return { color: '#059669', backgroundColor: '#d1f2eb', icon: '🛡️' };
      case 2: // Terminé
        return { color: '#0ea5e9', backgroundColor: '#e0f2fe', icon: '🏁' };
      case 3: // Remboursé
        return { color: '#8b5cf6', backgroundColor: '#f3e8ff', icon: '💰' };
      default:
        return { color: '#64748b', backgroundColor: '#f1f5f9', icon: '❓' };
    }
  };

  const statutStyle = getStatutStyle(statutBillet);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔬</div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Simulation de Retard
        </h1>
        <p style={{
          fontSize: '16px',
          opacity: '0.9',
          margin: '0',
          fontWeight: '300'
        }}>
          Vérification et traitement des retards de vol
        </p>
        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '6px 16px',
          marginTop: '12px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Étape 3/3
        </div>
      </div>

      {/* Informations du billet */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
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
            borderRadius: '12px',
            padding: '12px',
            marginRight: '16px',
            fontSize: '20px'
          }}>
            📄
          </div>
          <div>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '600',
              margin: '0 0 4px 0',
              color: '#1e293b'
            }}>
              Billet #{detailsBillet.id}
            </h2>
            <div style={{
              fontSize: '14px',
              color: '#64748b'
            }}>
              Détails de votre réservation
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '8px'
            }}>💰</div>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '4px'
            }}>
              {detailsBillet.prixEur} €
            </div>
            <div style={{
              fontSize: '12px',
              color: '#64748b'
            }}>
              Prix du billet
            </div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#f0f9ff',
            borderRadius: '12px',
            border: '1px solid #bae6fd',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '8px'
            }}>⏱️</div>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '4px'
            }}>
              {detailsBillet.dureeVol}h
            </div>
            <div style={{
              fontSize: '12px',
              color: '#64748b'
            }}>
              Durée du vol
            </div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: statutStyle.backgroundColor,
            borderRadius: '12px',
            border: `1px solid ${statutStyle.color}20`,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '8px'
            }}>
              {statutStyle.icon}
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: statutStyle.color,
              marginBottom: '4px'
            }}>
              {statutTexte}
            </div>
            <div style={{
              fontSize: '12px',
              color: statutStyle.color,
              opacity: '0.8'
            }}>
              Statut actuel
            </div>
          </div>
        </div>
      </div>

      {/* Section de simulation - affichée seulement si NON remboursé */}
{statutBillet !== 3 && (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '2px solid #f1f5f9'
    }}>
      <div style={{
        backgroundColor: '#f59e0b',
        color: 'white',
        borderRadius: '12px',
        padding: '12px',
        marginRight: '16px',
        fontSize: '20px'
      }}>
        ⚡
      </div>
      <div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          margin: '0 0 4px 0',
          color: '#1e293b'
        }}>
          Simuler un Retard
        </h3>
        <div style={{
          fontSize: '14px',
          color: '#64748b'
        }}>
          Entrez le retard réel à l'arrivée pour déclencher le processus de remboursement
        </div>
      </div>
    </div>

    {/* Formulaire de simulation */}
    <div style={{
      marginBottom: '24px'
    }}>
      <div style={{
        marginBottom: '16px'
      }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px'
        }}>
          Retard à l'arrivée (en heures)
        </label>
        <input
          type="number"
          value={retard}
          onChange={(e) => setRetard(e.target.value)}
          placeholder="Ex: 5"
          min="0"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            backgroundColor: 'white'
          }}
        />
        <div style={{
          fontSize: '12px',
          color: '#64748b',
          marginTop: '6px'
        }}>
          Seuil de remboursement: {detailsBillet.dureeVol}h (durée du vol)
        </div>
      </div>

      {/* Bouton de vérification - repositionné sous l'input */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px'
      }}>
        <button 
          onClick={handleSimulation}
          disabled={loading || !retard}
          style={{
            padding: '16px 32px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '12px',
            border: 'none',
            background: (loading || !retard) 
              ? '#e2e8f0' 
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: (loading || !retard) ? '#94a3b8' : 'white',
            cursor: (loading || !retard) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            boxShadow: (loading || !retard) ? 'none' : '0 2px 8px rgba(245, 158, 11, 0.3)'
          }}
          onMouseOver={(e) => {
            if (!loading && retard) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = (loading || !retard) ? 'none' : '0 2px 8px rgba(245, 158, 11, 0.3)';
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Transaction en cours...
            </>
          ) : (
            <>
              🔍 Vérifier sur la blockchain
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
      
      {/* Message de remboursement pour les billets déjà remboursés */}
      {statutBillet === 3 && (
        <div style={{
          backgroundColor: '#f3e8ff',
          border: '2px solid #c084fc',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>🎉</div>
          <div style={{
            color: '#7c3aed',
            fontWeight: '600',
            fontSize: '20px',
            marginBottom: '12px'
          }}>
            Remboursement déjà effectué !
          </div>
          <div style={{
            color: '#8b5cf6',
            fontSize: '16px'
          }}>
            Ce billet a déjà été remboursé. 50% du prix de l'assurance vous a été versé sur la blockchain.
          </div>
        </div>
      )}

      {/* Message de résultat */}
      {messageRemboursement && (
        <div style={{
          backgroundColor: messageRemboursement.includes('Félicitations') ? '#f0fdf4' : 
                           messageRemboursement.includes('Pas de remboursement') ? '#fef2f2' : '#fef3c7',
          border: `2px solid ${messageRemboursement.includes('Félicitations') ? '#bbf7d0' : 
                              messageRemboursement.includes('Pas de remboursement') ? '#fecaca' : '#fde68a'}`,
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          color: messageRemboursement.includes('Félicitations') ? '#166534' : 
                 messageRemboursement.includes('Pas de remboursement') ? '#dc2626' : '#92400e'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div style={{
              fontSize: '24px',
              marginTop: '2px'
            }}>
              {messageRemboursement.includes('Félicitations') ? '🎉' : 
               messageRemboursement.includes('Pas de remboursement') ? '😞' : '⚠️'}
            </div>
            <div style={{
              flex: 1,
              lineHeight: '1.6'
            }}>
              <div style={{
                fontWeight: '600',
                fontSize: '16px',
                marginBottom: '8px'
              }}>
                {messageRemboursement.includes('Félicitations') ? 'Remboursement accordé !' :
                 messageRemboursement.includes('Pas de remboursement') ? 'Aucun remboursement' :
                 'Attention'}
              </div>
              <div style={{
                whiteSpace: 'pre-line',
                fontSize: '14px'
              }}>
                {messageRemboursement}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton terminer */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '32px'
      }}>
        <button 
          onClick={onTermine}
          style={{
            padding: '16px 32px',
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
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f8fafc';
            e.target.style.borderColor = '#cbd5e1';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Terminer la simulation
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
            color: #f59e0b;
          }
          
          details summary::-webkit-details-marker {
            color: #f59e0b;
          }
        `}
      </style>
    </div>
  );
}

export default SimulationRetard;