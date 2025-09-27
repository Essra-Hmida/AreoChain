import React, { useState, useEffect } from 'react';

function Historique({ billets, onSimuler, contract, onRefresh }) {
  const [billetsDetails, setBilletsDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  
  const convertirBigInt = (obj) => {
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    if (Array.isArray(obj)) {
      return obj.map(convertirBigInt);
    }
    if (obj !== null && typeof obj === 'object') {
      const converted = {};
      for (const [key, value] of Object.entries(obj)) {
        converted[key] = convertirBigInt(value);
      }
      return converted;
    }
    return obj;
  };

  const getStatutTexte = (statutNum) => {
    switch(Number(statutNum)) {
      case 0: return "Disponible";
      case 1: return "Assuré";
      case 2: return "Terminé";
      case 3: return "Remboursé";
      default: return "Inconnu";
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

  const formatPrixETH = (prixEnWei) => {
    try {
      const wei = typeof prixEnWei === 'string' ? prixEnWei : prixEnWei.toString();
      return `${(parseFloat(wei) / 1e18).toFixed(6)} ETH`;
    } catch {
      return "N/A";
    }
  };

  // Fonction pour rafraîchir les données depuis le contract
  const rafraichirDepuisContract = async () => {
    if (!contract) return [];

    try {
      // Obtenir l'adresse de l'utilisateur connecté
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
        return [];
      }

      let billetsUtilisateur = [];

      // Parcourir tous les billets pour trouver ceux de l'utilisateur
      try {
        const compteur = await contract.compteurBillets();
        for (let i = 1; i <= Number(compteur); i++) {
          try {
            const billet = await contract.getBillet(i);
            if (billet["1"] && billet["1"].toLowerCase() === adresseUtilisateur.toLowerCase()) {
              const billetData = {
                id: i,
                acheteur: billet["1"],
                prixEnWei: billet["2"],
                dureeVol: billet["3"],
                statut: billet["4"]
              };
              billetsUtilisateur.push(convertirBigInt(billetData));
            }
          } catch (err) {
            console.warn(`Erreur récupération billet ${i}:`, err);
          }
        }
      } catch (err) {
        console.warn("compteurBillets non disponible:", err);
      }

      return billetsUtilisateur;

    } catch (err) {
      console.error("Erreur générale récupération billets:", err);
      throw err;
    }
  };

  // Fonction pour rafraîchir manuellement les données
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const nouveauxBillets = await rafraichirDepuisContract();
      
      // Traiter les nouveaux billets
      const detailsPromises = nouveauxBillets.map(async (billet) => {
        try {
          // Pour les billets récupérés du contract, on a déjà toutes les infos nécessaires
          const result = {
            id: billet.id,
            acheteur: billet.acheteur,
            prixEnWei: billet.prixEnWei,
            dureeVol: billet.dureeVol,
            statut: billet.statut,
            prixEur: "200", // Valeur par défaut ou récupérée d'ailleurs
            datePaiement: null
          };
          return convertirBigInt(result);
        } catch (err) {
          console.error(`Erreur traitement billet ${billet.id}:`, err);
          return convertirBigInt({
            id: billet.id,
            acheteur: billet.acheteur || "Erreur",
            prixEnWei: billet.prixEnWei || "0",
            dureeVol: billet.dureeVol || "0",
            statut: billet.statut || null,
            prixEur: "200",
            erreur: true
          });
        }
      });

      const nouveauxDetails = await Promise.all(detailsPromises);
      setBilletsDetails(nouveauxDetails);
      
      // Appeler le callback de rafraîchissement si fourni
      if (onRefresh) {
        onRefresh(nouveauxBillets);
      }
      
    } catch (err) {
      console.error("Erreur lors du rafraîchissement:", err);
      setErreur("Erreur lors du rafraîchissement: " + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Récupérer et traiter les détails des billets
  useEffect(() => {
    const recupererDetailsBllets = async () => {
      try {
        setLoading(true);
        setErreur("");

        let billetsAUtiliser = billets;

        // Si aucun billet n'est passé en props, essayer de les récupérer depuis le contract
        if (!billetsAUtiliser || billetsAUtiliser.length === 0) {
          billetsAUtiliser = await rafraichirDepuisContract();
        }

        if (!billetsAUtiliser || billetsAUtiliser.length === 0) {
          setBilletsDetails([]);
          return;
        }

        const detailsPromises = billetsAUtiliser.map(async (billet, index) => {
          try {
            // Si le billet contient déjà les détails complets du contract
            if (billet["0"] !== undefined || billet.prixEnWei !== undefined) {
              const result = {
                id: billet.id || billet["0"],
                acheteur: billet["1"] || billet.acheteur,
                prixEnWei: billet["2"] || billet.prixEnWei,
                dureeVol: billet["3"] || billet.dureeVol,
                statut: billet["4"] || billet.statut,
                prixEur: billet.prix || billet.prixEur || "200",
                datePaiement: billet.datePaiement
              };
              return convertirBigInt(result);
            } else if (contract && billet.id) {
              // Récupérer les données les plus récentes depuis le contract
              const billetInfo = await contract.getBillet(billet.id);
              const result = {
                id: billet.id,
                acheteur: billetInfo["1"],
                prixEnWei: billetInfo["2"],
                dureeVol: billetInfo["3"],
                statut: billetInfo["4"], // Statut le plus récent depuis le contract
                prixEur: billet.prix || billet.prixEur || "200",
                datePaiement: billet.datePaiement
              };
              return convertirBigInt(result);
            } else {
              // Utiliser les données disponibles
              return convertirBigInt({
                id: billet.id || index,
                acheteur: billet.acheteur || "N/A",
                prixEnWei: billet.prixEnWei || "0",
                dureeVol: billet.dureeVol || billet.duree || "0",
                statut: billet.statut || null,
                prixEur: billet.prix || billet.prixEur || "200",
                datePaiement: billet.datePaiement
              });
            }
          } catch (err) {
            console.error(`Erreur récupération billet ${billet.id || index}:`, err);
            return convertirBigInt({
              id: billet.id || index,
              acheteur: "Erreur",
              prixEnWei: "0",
              dureeVol: billet.duree || billet.dureeVol || "0",
              statut: null,
              prixEur: billet.prix || "200",
              erreur: true
            });
          }
        });

        const details = await Promise.all(detailsPromises);
        setBilletsDetails(details);

      } catch (err) {
        console.error("Erreur lors de la récupération des détails:", err);
        setErreur("Impossible de charger les détails des billets: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    recupererDetailsBllets();
  }, [contract, billets]);

  if (loading) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Historique des Billets
          </h1>
          <p style={{
            fontSize: '16px',
            opacity: '0.9',
            margin: '0',
            fontWeight: '300'
          }}>
            Chargement de vos billets assurés...
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Récupération de vos billets assurés...
          </p>
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header avec bouton de rafraîchissement */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
        position: 'relative'
      }}>
        {/* Bouton de rafraîchissement */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            padding: '8px 16px',
            color: 'white',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseOver={(e) => {
            if (!refreshing) {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            }
          }}
          onMouseOut={(e) => {
            if (!refreshing) {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }
          }}
        >
          <span style={{
            animation: refreshing ? 'spin 1s linear infinite' : 'none'
          }}>
            🔄
          </span>
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>

        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Historique des Billets
        </h1>
        <p style={{
          fontSize: '16px',
          opacity: '0.9',
          margin: '0',
          fontWeight: '300'
        }}>
          Vos billets assurés AéroChain ({billetsDetails.length} billet{billetsDetails.length !== 1 ? 's' : ''})
        </p>
      </div>

      {/* Message d'erreur */}
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

      {/* Liste des billets */}
      {billetsDetails.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✈️</div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 8px 0',
            color: '#1e293b'
          }}>
            Aucun billet trouvé
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            margin: '0'
          }}>
            Vous n'avez encore acheté aucune assurance vol.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {billetsDetails.sort((a, b) => Number(b.id) - Number(a.id)).map((billet, index) => {
            const statutStyle = getStatutStyle(billet.statut);
            
            return (
              <div
                key={billet.id || index}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* En-tête de la carte */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #f1f5f9'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center'
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
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        margin: '0',
                        color: '#1e293b'
                      }}>
                        Billet #{billet.id}
                      </h3>
                      {billet.datePaiement && (
                        <p style={{
                          fontSize: '12px',
                          color: '#64748b',
                          margin: '2px 0 0 0'
                        }}>
                          Payé le {new Date(billet.datePaiement).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Badge de statut */}
                  <div style={{
                    backgroundColor: statutStyle.backgroundColor,
                    border: `1px solid ${statutStyle.borderColor}`,
                    borderRadius: '20px',
                    padding: '4px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '14px' }}>{statutStyle.icon}</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: statutStyle.textColor
                    }}>
                      {getStatutTexte(billet.statut)}
                    </span>
                  </div>
                </div>

                {/* Détails du billet */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #f1f5f9'
                  }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Durée du vol</span>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>
                      {billet.dureeVol} heure{Number(billet.dureeVol) !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #f1f5f9'
                  }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Prix du billet</span>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>
                      {billet.prixEur} €
                    </span>
                  </div>

                  {billet.prixEnWei && billet.prixEnWei !== "0" && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <span style={{ color: '#64748b', fontSize: '14px' }}>Prix assurance</span>
                      <span style={{ 
                        fontWeight: '600', 
                        color: '#3b82f6',
                        fontSize: '14px'
                      }}>
                        {formatPrixETH(billet.prixEnWei)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message de remboursement pour les billets remboursés */}
                {Number(billet.statut) === 3 && (
                  <div style={{
                    backgroundColor: '#f3e5f5',
                    border: '1px solid #ce93d8',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      color: '#6a1b9a',
                      fontWeight: '600',
                      fontSize: '14px',
                      marginBottom: '4px'
                    }}>
                      🎉 Remboursement effectué !
                    </div>
                    <div style={{
                      color: '#8e24aa',
                      fontSize: '12px'
                    }}>
                      50% du prix de l'assurance vous a été remboursé
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Bouton Simuler le retard - visible seulement pour les billets assurés */}
                  {Number(billet.statut) === 1 && (
                    <button
                      onClick={() => onSimuler(billet)}
                      style={{
                        flex: '1',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        borderRadius: '8px',
                        border: '2px solid #f59e0b',
                        backgroundColor: 'white',
                        color: '#f59e0b',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#fef3c7';
                        e.target.style.borderColor = '#d97706';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#f59e0b';
                      }}
                    >
                      ⏰ Simuler retard
                    </button>
                  )}

                  {/* Bouton d'information selon le statut */}
                  {Number(billet.statut) === 0 && (
                    <div style={{
                      flex: '1',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      borderRadius: '8px',
                      border: '1px solid #fbbf24',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      textAlign: 'center'
                    }}>
                      ⏳ En attente de paiement
                    </div>
                  )}

                  {Number(billet.statut) === 2 && (
                    <div style={{
                      flex: '1',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      borderRadius: '8px',
                      border: '1px solid #60a5fa',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      textAlign: 'center'
                    }}>
                      🏁 Vol terminé
                    </div>
                  )}

                  {Number(billet.statut) === 3 && (
                    <div style={{
                      flex: '1',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      borderRadius: '8px',
                      border: '1px solid #a78bfa',
                      backgroundColor: '#ede9fe',
                      color: '#6b21a8',
                      textAlign: 'center'
                    }}>
                      💰 Remboursé avec succès
                    </div>
                  )}
                </div>

                {/* Message d'erreur pour ce billet */}
                {billet.erreur && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    color: '#dc2626',
                    fontSize: '12px'
                  }}>
                    ⚠️ Erreur lors du chargement des détails
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CSS pour les animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Historique;