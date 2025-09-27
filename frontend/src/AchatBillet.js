
import React, { useState } from "react";

function AchatBillet({ onAchatSubmit, contract }) {
  const [dureeVol, setDureeVol] = useState("");
  const [prixEur, setPrixEur] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification du wallet
    if (!contract) {
      alert("Connectez votre wallet avant d'acheter !");
      return;
    }

    const dureeNum = Number(dureeVol);
    const prixNum = Number(prixEur);

   
    if (dureeNum <= 0 || prixNum <= 0) {
      alert("Veuillez saisir une durée et un prix valides !");
      return;
    }

    setLoading(true);
    try {
    
      await onAchatSubmit({ dureeVol: dureeNum, prixEur: prixNum });

      
      setDureeVol("");
      setPrixEur("");
    } catch (error) {
      console.error("Erreur lors de l'achat:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✈️</div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Achat du billet
        </h1>
        <p style={{
          fontSize: '16px',
          opacity: '0.9',
          margin: '0 0 16px 0',
          fontWeight: '300'
        }}>
          Protégez-vous contre les retards de vol avec notre assurance intelligente basée sur la blockchain
        </p>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '8px 16px',
          display: 'inline-block',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Étape 1/3
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        {/* En-tête de section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '2px solid #f1f5f9'
        }}>
          <div style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '12px',
            padding: '12px',
            marginRight: '16px',
            fontSize: '24px'
          }}>
            ✈️
          </div>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              margin: '0 0 4px 0',
              color: '#1e293b'
            }}>
              Souscrire une Assurance Vol
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '0'
            }}>
              Achat d'un billet avec assurance retard
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Durée du vol */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '20px',
              border: '2px solid #e2e8f0',
              transition: 'all 0.2s'
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Durée du vol (heures) :
              </label>
              <div style={{
                position: 'relative'
              }}>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={dureeVol}
                  onChange={(e) => setDureeVol(e.target.value)}
                  required
                  placeholder="Ex: 2.5"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#1e293b',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px'
                }}>
                  ⏱️
                </div>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                margin: '8px 0 0 0'
              }}>
                Durée estimée de votre vol
              </p>
            </div>

            {/* Prix du billet */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '20px',
              border: '2px solid #e2e8f0',
              transition: 'all 0.2s'
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Prix du billet (EUR) :
              </label>
              <div style={{
                position: 'relative'
              }}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={prixEur}
                  onChange={(e) => setPrixEur(e.target.value)}
                  required
                  placeholder="Ex: 200"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#1e293b',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px'
                }}>
                  💰
                </div>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                margin: '8px 0 0 0'
              }}>
                Prix original de votre billet
              </p>
            </div>
          </div>

          
          {/* Bouton de souscription */}
          <button
            type="submit"
            disabled={loading || !contract}
            style={{
              width: '100%',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '12px',
              border: 'none',
              background: (loading || !contract)
                ? '#e2e8f0'
                : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: (loading || !contract) ? '#94a3b8' : 'white',
              cursor: (loading || !contract) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: (loading || !contract) ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.4)'
            }}
            onMouseOver={(e) => {
              if (!loading && contract) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.5)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading && contract) {
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
                Traitement en cours...
              </>
            ) : !contract ? (
              <>🔒 Connectez votre wallet</>
            ) : (
              <>✈️ Souscrire le billet</>
            )}
          </button>

          {!contract && (
            <p style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#64748b',
              margin: '12px 0 0 0'
            }}>
              Vous devez connecter votre wallet pour pouvoir souscrire une assurance
            </p>
          )}
        </form>
      </div>

      {/* CSS pour l'animation */}
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

export default AchatBillet;