# ✈️ Application d’Assurance Vol sur Blockchain Ethereum
## 📜 Contexte du Projet

Ce projet s’inscrit dans le cadre du module **Blockchain** au sein de la **Faculté des Sciences de Sfax**, sous la supervision de **Claude Duvallet**.

Année universitaire : **2025-2026**

Il a été conçu pour démontrer comment **la technologie blockchain et les smart contracts Ethereum** peuvent être utilisés dans le domaine de l’**assurance des vols aériens**, en automatisant la gestion des indemnisations en cas de retard ou d’annulation.

L’**Application d’Assurance Vol sur Blockchain Ethereum** illustre une intégration pratique de la **finance décentralisée (DeFi)** dans le secteur de l’assurance, garantissant transparence, sécurité et automatisation.

---

### 👩‍💻 Réalisé par 
- **Mabrouka Messaoudi**  
  Email: mabroukamessaoudi897@gmail.com  
- **Essra Hmida**  
  Email: hmidaesraa@gmail.com  
- **Hana Kanoun**  
  Email: kanounhana6@gmail.com  

---
## 🚀 Description du Projet
L’**Application d’Assurance Vol sur Blockchain Ethereum** permet :
- L’achat de billets d’avion.
- La souscription automatique à une assurance en cas de retard ou d’annulation.
- L’exécution automatique des remboursements via le smart contract.
- La transparence et la traçabilité grâce à la blockchain.

Cette solution élimine le besoin d’intermédiaires (compagnies d’assurances classiques) et réduit le risque de fraude.

---

## 🎯 Objectifs
1. **Automatiser** le processus d’assurance via des **smart contracts Solidity**.  
2. **Garantir la transparence** des transactions financières entre voyageurs et assureurs.  
3. **Simuler** les scénarios de vols (retard, annulation) pour tester le contrat intelligent.  
4. **Déployer** et **interagir** avec le contrat via une application web utilisant **React** et **Ethers.js**.

---

## 🏗️ Architecture du Projet
Le projet est composé de plusieurs couches :

```
AeroChain/
│
|── asuurance/
│   ├── contracts/
│   │   └── AssuranceVol.sol        # Smart contract Solidity
│   │── scripts/
│   │   └── deploy.js               # Script de déploiement du contrat         
│   └── hardhat.config.ts           # Configuration Hardhat
│
|
│── frontend/
│   ├── src/
│   │   ├── App.js                 # Interface utilisateur React
│   │   ├── AchatBillet.js         # Composant d’achat de billet
│   │   ├── Paiement.js            # Composant de paiement
│   │   ├── SimulationRetard.js    # Simulation des retards/annulations
│   │   └── Historique.js          # Historique des transactions
│   └── package.json  
│          
└── README.md                      # Documentation du projet                        
```

---

## ⚙️ Prérequis
Avant de démarrer, assurez-vous d’avoir installé :
- [Node.js](https://nodejs.org/) (v18+)
- [Hardhat](https://hardhat.org/)
- [MetaMask](https://metamask.io/)
- [React.js](https://react.dev/)
- [Ethers.js](https://docs.ethers.org/)

---

## 📦 Installation et Déploiement
### 1. Cloner le dépôt
```bash
git clone https://github.com/Essra-Hmida/AreoChain.git
cd AreoChain
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Lancer le réseau local Hardhat
```bash
npx hardhat node
```

### 4. Déployer le smart contract
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Lancer le frontend React
```bash
cd frontend
npm install
npm start
```

---

## 🌐 Connexion avec MetaMask
1. Ouvrir **MetaMask**.  
2. Aller dans **Paramètres → Réseaux → Ajouter un réseau**.  
3. Remplir les informations suivantes :  
   - **Nom du réseau** : Localhost 8545  
   - **URL RPC** : `http://127.0.0.1:8545`  
   - **ID de chaîne** : `31337`  
   - **Symbole de la devise** : ETH  
4. Sauvegarder et sélectionner **Localhost 8545** dans le sélecteur de réseau.

---

## 📈 Fonctionnalités Clés
- ✅ Achat de billets d’avion via l’interface web  
- ✅ Paiement sécurisé sur Ethereum  
- ✅ Simulation des retards/annulations de vols  
- ✅ Remboursement automatique par le smart contract  
- ✅ Historique des transactions on-chain  

---

## 📚 Technologies Utilisées
- **Backend Blockchain** : Solidity, Hardhat  
- **Frontend** : React.js, Ethers.js  
- **Réseau Local** : Hardhat Network, MetaMask  
- **Outils** : Node.js, dotenv

---

## 📜 Licence
Ce projet est sous licence **MIT**.  
Vous êtes libre de l’utiliser, de le modifier et de le distribuer sous réserve de mentionner les auteurs.
 
