import { BrowserProvider, Contract, sha256, toUtf8Bytes } from "ethers";

export type PolygonNetwork = "amoy" | "polygon";

const NETWORKS = {
  amoy: {
    chainId: 80_002n,
    chainHex: "0x13882",
    name: "Polygon Amoy",
    rpcUrl: "https://rpc-amoy.polygon.technology",
    explorerUrl: "https://amoy.polygonscan.com",
  },
  polygon: {
    chainId: 137n,
    chainHex: "0x89",
    name: "Polygon",
    rpcUrl: "https://polygon-bor-rpc.publicnode.com",
    explorerUrl: "https://polygonscan.com",
  },
} satisfies Record<
  PolygonNetwork,
  { chainId: bigint; chainHex: string; name: string; rpcUrl: string; explorerUrl: string }
>;

const REGISTRY_ABI = [
  "function anchorCertificate(bytes32 certificateId, bytes32 studentHash, uint64 completedAt)",
];

type EthereumProvider = {
  request: (request: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

async function switchToNetwork(provider: BrowserProvider, network: PolygonNetwork) {
  const config = NETWORKS[network];
  const chainParams = [
    {
      chainId: config.chainHex,
      chainName: config.name,
      nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
      rpcUrls: [config.rpcUrl],
      blockExplorerUrls: [config.explorerUrl],
    },
  ];
  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: config.chainHex }]);
  } catch (error) {
    if ((error as { code?: number }).code !== 4902) throw error;
    await provider.send("wallet_addEthereumChain", chainParams);
    await provider.send("wallet_switchEthereumChain", [{ chainId: config.chainHex }]);
  }
}

export async function anchorCertificateOnPolygon({
  network: selectedNetwork,
  registryAddress,
  certificateHash,
  studentId,
  completedAt,
}: {
  network: PolygonNetwork;
  registryAddress: string;
  certificateHash: string;
  studentId: string;
  completedAt: string;
}) {
  if (!window.ethereum) throw new Error("Instalo MetaMask për të publikuar certifikatën.");
  const config = NETWORKS[selectedNetwork];
  let provider = new BrowserProvider(window.ethereum);
  let network = await provider.getNetwork();
  if (network.chainId !== config.chainId) {
    await switchToNetwork(provider, selectedNetwork);
    provider = new BrowserProvider(window.ethereum);
    network = await provider.getNetwork();
  }
  if (network.chainId !== config.chainId) throw new Error(`Zgjidh rrjetin ${config.name}.`);

  const signer = await provider.getSigner();
  const registry = new Contract(registryAddress, REGISTRY_ABI, signer);
  const studentHash = sha256(toUtf8Bytes(studentId));
  const completedAtSeconds = Math.floor(new Date(completedAt).getTime() / 1000);
  if (!Number.isFinite(completedAtSeconds) || completedAtSeconds <= 0)
    throw new Error("Data e përfundimit mungon.");

  const transaction = await registry.getFunction("anchorCertificate")(
    certificateHash,
    studentHash,
    completedAtSeconds,
  );
  await transaction.wait();
  return transaction.hash as string;
}
