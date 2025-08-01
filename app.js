const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let isOwner = false;

const contractAddress = "0xaA8AA19D7257ABf33Ed968102045DAF69F7dDa43";
const contractABI = [
  // 🔐 Owner
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },

  // 🔄 Swap de tokens
  {
    "inputs": [
      { "internalType": "address", "name": "fromToken", "type": "address" },
      { "internalType": "address", "name": "toToken", "type": "address" },
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" }
    ],
    "name": "swap",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // 💸 Recarga de contrato
  {
    "inputs": [],
    "name": "recharge",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },

  // 🧾 Retiro de fondos
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // 🧮 Consulta de balance
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // 📊 Consulta de tasa de cambio (opcional)
  {
    "inputs": [
      { "internalType": "address", "name": "fromToken", "type": "address" },
      { "internalType": "address", "name": "toToken", "type": "address" }
    ],
    "name": "getExchangeRate",
    "outputs": [
      { "internalType": "uint256", "name": "rate", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const contract = new ethers.Contract(contractAddress, contractABI, provider);

// ✅ Verifica si el usuario es owner
async function checkIfOwner() {
  try {
    signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    const ownerAddress = await contract.owner();
    isOwner = userAddress.toLowerCase() === ownerAddress.toLowerCase();
  } catch (err) {
    console.error("Error verificando owner:", err);
  }
}

// 🔧 Mostrar panel de admin si eres el boss
function toggleAdminPanel() {
  if (!isOwner) {
    alert("🚫 Solo el creador puede usar esta sección.");
    return;
  }
  const panel = document.querySelector(".admin");
  panel.style.display = (panel.style.display === "none") ? "block" : "none";
}

// 💸 Recargar contrato con ETH
async function rechargeContract() {
  if (!isOwner) return alert("No tienes permiso para recargar.");

  try {
    const amount = document.getElementById("amount").value;
    const tx = await contract.connect(signer).recharge({
      value: ethers.utils.parseEther(amount)
    });
    await tx.wait();
    alert("✅ Recargado con " + amount + " ETH");
  } catch (err) {
    console.error(err);
    alert("❌ Error al recargar: " + err.message);
  }
}

// 🧾 Retirar fondos
async function withdrawFromContract() {
  if (!isOwner) return alert("No tienes permiso para retirar.");

  try {
    const amount = document.getElementById("amount").value;
    const tx = await contract.connect(signer).withdraw(
      ethers.utils.parseEther(amount)
    );
    await tx.wait();
    alert("✅ Retiro exitoso de " + amount + " ETH");
  } catch (err) {
    console.error(err);
    alert("❌ Error al retirar: " + err.message);
  }
}

// 🔄 Ejecutar swap
async function executeSwap(fromToken, toToken, amountIn) {
  try {
    const tx = await contract.connect(signer).swap(fromToken, toToken, amountIn);
    await tx.wait();
    alert("✅ Swap exitoso");
  } catch (err) {
    console.error(err);
    alert("❌ Error en swap: " + err.message);
  }
}

// 💰 Ver balance del contrato
async function showContractBalance() {
  try {
    const balance = await contract.getBalance();
    alert("🔎 Balance actual: " + ethers.utils.formatEther(balance) + " ETH");
  } catch (err) {
    console.error(err);
  }
}

// 📊 Consultar tasa de cambio
async function getRate(fromToken, toToken) {
  try {
    const rate = await contract.getExchangeRate(fromToken, toToken);
    alert("📈 Tasa de cambio: " + rate.toString());
  } catch (err) {
    console.error(err);
  }
}

// 🚀 Inicio automático
window.onload = async () => {
  try {
    await provider.send("eth_requestAccounts", []);
    await checkIfOwner();
  } catch (err) {
    console.error("Error al conectar wallet:", err);
    alert("❌ No se pudo conectar con MetaMask");
  }
};
