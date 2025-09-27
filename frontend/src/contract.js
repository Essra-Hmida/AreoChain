// src/contract.js
import { ethers } from "ethers";
import contractJSON from "./contracts/abi/AssuranceVol.json";
export const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // ← adresse affichée au déploiement
export const contractABI = contractJSON.abi;

export function getContract(signerOrProvider) {
  return new ethers.Contract(contractAddress, contractABI, signerOrProvider);
}
