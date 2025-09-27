// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AssuranceVol {
    address payable public proprietaire;
    uint256 public tauxConversionEthEur;
    uint256 public compteurBillets;

    struct Billet {
        uint256 id;
        address payable acheteur;
        uint256 prixEnWei;
        uint256 dureeVol;
        StatutBillet statut;
    }

    enum StatutBillet { Disponible, Assure, Termine, Rembourse }

    mapping(uint256 => Billet) public billets;

    event BilletSouscrit(uint256 indexed id, address indexed acheteur, uint256 prixEnWei, uint256 dureeVol);
    event AssuranceActivee(uint256 indexed id);
    event RemboursementEffectue(uint256 indexed id, uint256 montantRembourse);
    event FondsRetires(uint256 montant);

    constructor(uint256 _tauxConversion) {
        proprietaire = payable(msg.sender);
        tauxConversionEthEur = _tauxConversion;
    }

    function souscrireAssurance(uint256 _dureeVol, uint256 _prixEnEur) external {
        require(_dureeVol > 0, "La duree du vol doit etre superieure a zero.");
        require(_prixEnEur > 0, "Le prix du billet doit etre superieur a zero.");

        compteurBillets++;
        uint256 billetId = compteurBillets;

        uint256 prixEnWei = (_prixEnEur * 1 ether) / tauxConversionEthEur;

        billets[billetId] = Billet({
            id: billetId,
            acheteur: payable(msg.sender),
            prixEnWei: prixEnWei,
            dureeVol: _dureeVol,
            statut: StatutBillet.Disponible
        });

        emit BilletSouscrit(billetId, msg.sender, prixEnWei, _dureeVol);
    }

    function payerBillet(uint256 _billetId) external payable {
        Billet storage billet = billets[_billetId];
        require(billet.id != 0, "Ce billet n'existe pas.");
        require(msg.sender == billet.acheteur, "Vous n'etes pas l'acheteur de ce billet.");
        require(billet.statut == StatutBillet.Disponible, "Le billet n'est pas en attente de paiement.");
        require(msg.value == billet.prixEnWei, "Le montant envoye ne correspond pas au prix du billet.");

        billet.statut = StatutBillet.Assure;

        emit AssuranceActivee(_billetId);
    }

    
    function constaterRetard(uint256 _billetId, uint256 _retardEnHeures) external {
        Billet storage billet = billets[_billetId];
        require(billet.id != 0, "Ce billet n'existe pas.");
        require(billet.statut == StatutBillet.Assure, "L'assurance de ce billet n'est pas active.");

        if (_retardEnHeures > billet.dureeVol) {
            uint256 montantRembourse = billet.prixEnWei / 2;
            require(address(this).balance >= montantRembourse, "Fonds insuffisants pour remboursement.");

            billet.statut = StatutBillet.Rembourse;

            (bool success, ) = billet.acheteur.call{value: montantRembourse}("");
            require(success, "Remboursement echoue.");

            emit RemboursementEffectue(_billetId, montantRembourse);
        } else {
            billet.statut = StatutBillet.Termine;
        }
    }

    
    function retirerFonds(uint256 _montant) external {
        require(address(this).balance >= _montant, "Fonds insuffisants.");
        (bool success, ) = proprietaire.call{value: _montant}("");
        require(success, "Echec du retrait des fonds.");

        emit FondsRetires(_montant);
    }

    
    function setTauxConversion(uint256 _nouveauTaux) external {
        tauxConversionEthEur = _nouveauTaux;
    }

    function getBillet(uint256 _billetId) external view returns (Billet memory) {
        return billets[_billetId];
    }
}
