export type Lab = { id: string; m: number; x: number; s: number; t: string; g: string; need: string[]; steps: string[][]; res: string; fail: string[]; w?: number };
export const labs: Lab[] = [
  {
    "id": "lab-2",
    "m": 25,
    "x": 10,
    "s": 2,
    "t": "Instalimi i mjeteve",
    "g": "Përgatit mjedisin për gjithë kursin.",
    "w": 1,
    "need": [
      "Laptop me internet",
      "15 GB hapësirë të lirë"
    ],
    "steps": [
      [
        "Instalo VS Code",
        "Shkarko nga code.visualstudio.com dhe instalo me opsionet e paracaktuara."
      ],
      [
        "Instalo Node.js (LTS)",
        "Shkarko versionin LTS nga nodejs.org. Pastaj hap {term} dhe verifiko.",
        "node -v\nnpm -v"
      ],
      [
        "Instalo Git",
        "Shkarko nga git-scm.com.{gitmac}",
        "git --version"
      ],
      [
        "Instalo Python 3",
        "Nga python.org. Do të të duhet në laboratorin e seancës 6.{pynote}",
        "{py} --version"
      ],
      [
        "Instalo MetaMask",
        "Vetëm nga metamask.io. Krijo wallet të ri testimi dhe shkruaj seed phrase në letër, offline."
      ],
      [
        "Hap Remix IDE",
        "Shko te remix.ethereum.org. Punon në shfletues dhe është plani rezervë nëse diçka nuk instalohet."
      ]
    ],
    "res": "Të gjitha komandat japin numër versioni dhe Remix hapet në shfletues.",
    "fail": [
      "Komanda nuk njihet: mbyll dhe rihap terminalin pas instalimit.",
      "Windows: nëse bllokohet instalimi, provo si administrator.",
      "Mos humb kohë: në çdo rast mund të punosh vetëm me Remix."
    ]
  },
  {
    "id": "lab-6",
    "m": 30,
    "x": 15,
    "s": 6,
    "t": "Hash dhe Merkle në Python",
    "g": "Ndërto një hash, një Merkle root dhe provo se ndryshimi i të dhënave ndryshon gjithçka.",
    "need": [
      "Python 3 i instaluar",
      "Skedar i ri: hash.py"
    ],
    "steps": [
      [
        "Hash i një teksti",
        "Krijo hash.py me këtë kod dhe ekzekutoje me {py} hash.py.",
        "import hashlib\n\ndef h(x):\n    return hashlib.sha256(x.encode()).hexdigest()\n\nprint(h(\"Blockchain\"))\nprint(h(\"blockchain\"))"
      ],
      [
        "Ndrysho një shkronjë",
        "Krahaso dy hash-et. Sa shumë ndryshojnë? Kjo është efekti i ortekut."
      ],
      [
        "Ndërto Merkle root",
        "Shto në fund të skedarit.",
        "def merkle(txs):\n    level = [h(t) for t in txs]\n    while len(level) > 1:\n        if len(level) % 2:\n            level.append(level[-1])\n        level = [h(level[i] + level[i+1]) for i in range(0, len(level), 2)]\n    return level[0]\n\nprint(merkle([\"Tx1\", \"Tx2\", \"Tx3\", \"Tx4\"]))\nprint(merkle([\"Tx1\", \"Tx2\", \"Tx3\", \"TX4\"]))"
      ],
      [
        "Gjej një nonce (mini mining)",
        "Provo derisa hash-i të fillojë me katër zero.",
        "nonce = 0\nwhile not h(\"blockchain\" + str(nonce)).startswith(\"0000\"):\n    nonce += 1\nprint(nonce, h(\"blockchain\" + str(nonce)))"
      ],
      [
        "Analizo një transaksion real",
        "Hap një transaksion në etherscan.io dhe shkruaj: from, to, value, gas, tarifa, statusi."
      ]
    ],
    "res": "Dy root-e Merkle krejt të ndryshme, dhe një nonce që gjendet për disa sekonda.",
    "fail": [
      "Komanda python nuk njihet: në Mac përdor python3, në Windows rihap terminalin pas instalimit.",
      "Gabim me thonjëza: kopjo kodin me butonin Copy."
    ]
  },
  {
    "id": "lab-8",
    "m": 25,
    "x": 15,
    "s": 8,
    "t": "Bitcoin në testnet",
    "g": "Merr coin testimi dhe dërgo një transaksion për të parë inputs, outputs dhe tarifën.",
    "w": 1,
    "need": [
      "Wallet Bitcoin që mbështet testnet (e jep ligjëruesi)",
      "Link i faucet-it aktual nga ligjëruesi"
    ],
    "steps": [
      [
        "Hap wallet-in në testnet",
        "Zgjidh rrjetin testnet. Adresat e testnet fillojnë me tb1."
      ],
      [
        "Kopjo një adresë marrëse",
        "Përdor butonin Receive."
      ],
      [
        "Merr coin nga faucet",
        "Hap faucet-in që jep ligjëruesi, vendos adresën dhe kërko coin."
      ],
      [
        "Gjej transaksionin",
        "Në mempool.space (versioni testnet) kërko adresën tënde dhe ndiq konfirmimet."
      ],
      [
        "Dërgo një pjesë mbrapsht",
        "Dërgo një sasi të vogël te adresa e faucet-it ose e një shoku."
      ],
      [
        "Analizo transaksionin",
        "Shkruaj inputs, outputs, kusurin dhe tarifën. Kontrollo: inputs = outputs + tarifa."
      ]
    ],
    "res": "Një transaksion i konfirmuar ku e identifikon kusurin dhe tarifën.",
    "fail": [
      "Faucet-et shpesh bien ose kanë limit: provo një tjetër ose pyet ligjëruesin.",
      "Pa konfirmim: prit disa minuta, bllokët e Bitcoin vijnë rreth çdo 10 minuta."
    ]
  },
  {
    "id": "lab-10",
    "m": 20,
    "x": 15,
    "s": 10,
    "t": "MetaMask dhe Sepolia",
    "g": "Dërgo ETH testimi dhe lexo transaksionin në Etherscan.",
    "w": 1,
    "need": [
      "MetaMask i instaluar",
      "Link i faucet-it Sepolia nga ligjëruesi"
    ],
    "steps": [
      [
        "Aktivizo rrjetet e testimit",
        "MetaMask → zgjedhësi i rrjetit → shfaq rrjetet e testimit → zgjidh Sepolia."
      ],
      [
        "Kopjo adresën",
        "Kliko emrin e llogarisë për ta kopjuar."
      ],
      [
        "Merr ETH testimi",
        "Përdor faucet-in që jep ligjëruesi. Pas pak minutash shfaqet saldo."
      ],
      [
        "Dërgo ETH",
        "Te një koleg ose te llogaria jote e dytë në MetaMask. Sasi shumë e vogël, p.sh. 0.001 ETH."
      ],
      [
        "Hap transaksionin në Etherscan",
        "Shko te sepolia.etherscan.io dhe kërko hash-in e transaksionit."
      ],
      [
        "Lexo fushat",
        "Gjej: from, to, value, gas used, tarifa, bllokun dhe statusin."
      ]
    ],
    "res": "Transaksion Success në Sepolia dhe fushat e shkruara në fletore.",
    "fail": [
      "Saldo 0: faucet-i mund të vonojë ose të ketë limit ditor.",
      "Rrjeti i gabuar: sigurohu që lart shkruan Sepolia."
    ]
  },
  {
    "id": "lab-12",
    "m": 20,
    "x": 15,
    "s": 12,
    "t": "Contract-i i parë në Remix",
    "g": "Shkruaj, kompilo dhe provo SimpleStorage.",
    "need": [
      "Shfletues me remix.ethereum.org"
    ],
    "steps": [
      [
        "Krijo skedarin",
        "Në Remix, File Explorer → skedar i ri SimpleStorage.sol."
      ],
      [
        "Ngjite kodin në file",
        "Kopjo kodin më poshtë.",
        "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract SimpleStorage {\n    uint256 private value;\n\n    function set(uint256 v) public {\n        value = v;\n    }\n\n    function get() public view returns (uint256) {\n        return value;\n    }\n}"
      ],
      [
        "Kompilo",
        "Tab-i Solidity Compiler → versioni 0.8.x → Compile."
      ],
      [
        "Deploy në Remix VM",
        "Tab-i Deploy & Run → Environment: Remix VM → Deploy."
      ],
      [
        "Provo funksionet",
        "Thirr set me 42, pastaj get. Duhet të kthejë 42."
      ],
      [
        "Eksperimento",
        "Ndrysho kodin: shto një event dhe krahaso logs-et në terminal."
      ]
    ],
    "res": "get kthen vlerën që e vendose me set.",
    "fail": [
      "Gabim kompilimi: lexo rreshtin e shënuar, shpesh mungon ;.",
      "Pas ndryshimit të kodit duhet Compile dhe Deploy përsëri."
    ]
  },
  {
    "id": "lab-14",
    "m": 30,
    "x": 15,
    "s": 14,
    "t": "Ownable dhe Escrow",
    "g": "Ndërto një Escrow me kontroll qasjeje, events dhe errors.",
    "need": [
      "Remix IDE",
      "Të paktën dy llogari në Remix VM"
    ],
    "steps": [
      [
        "Krijo Escrow.sol",
        "Ngjite kodin në file.",
        "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract Escrow {\n    address public buyer;\n    address public seller;\n    bool public funded;\n    bool public released;\n\n    event Funded(address indexed buyer, uint256 amount);\n    event Released(address indexed seller, uint256 amount);\n\n    error NotBuyer();\n    error WrongState();\n\n    constructor(address _seller) {\n        buyer = msg.sender;\n        seller = _seller;\n    }\n\n    function deposit() external payable {\n        if (msg.sender != buyer) revert NotBuyer();\n        if (funded) revert WrongState();\n        funded = true;\n        emit Funded(msg.sender, msg.value);\n    }\n\n    function release() external {\n        if (msg.sender != buyer) revert NotBuyer();\n        if (!funded || released) revert WrongState();\n        released = true;\n        uint256 amount = address(this).balance;\n        (bool ok, ) = seller.call{value: amount}(\"\");\n        require(ok, \"Failed\");\n        emit Released(seller, amount);\n    }\n}"
      ],
      [
        "Deploy me adresën e shitësit",
        "Kopjo adresën e llogarisë së dytë në Remix VM dhe vendose si parametër te Deploy."
      ],
      [
        "Depozito",
        "Në fushën Value vendos 1 ether, pastaj thirr deposit."
      ],
      [
        "Çliro paratë",
        "Thirr release dhe shiko saldon e shitësit."
      ],
      [
        "Testo dështimin",
        "Ndërro llogarinë dhe thirr release. Duhet të shohësh NotBuyer."
      ],
      [
        "Shto një rregull",
        "Detyra A: shto refund që e kthen paranë te blerësi para çlirimit. Detyra B (Ownable): shto owner dhe modifier onlyOwner te një funksion setSeller.",
        "",
        "address public owner = msg.sender;\nerror NotOwner();\n\nmodifier onlyOwner() {\n    if (msg.sender != owner) revert NotOwner();\n    _;\n}\n\nfunction setSeller(address s) external onlyOwner {\n    seller = s;\n}\n\nfunction refund() external {\n    if (msg.sender != buyer) revert NotBuyer();\n    if (!funded || released) revert WrongState();\n    released = true;\n    (bool ok, ) = buyer.call{value: address(this).balance}(\"\");\n    require(ok, \"Failed\");\n}"
      ]
    ],
    "res": "Shitësi merr paranë dhe thirrja nga llogaria e gabuar dështon me NotBuyer.",
    "fail": [
      "Value mbetet 0: zgjidh njësinë (ether) para se të thërresësh deposit."
    ]
  },
  {
    "id": "lab-16",
    "m": 30,
    "x": 15,
    "s": 16,
    "t": "ERC-20 në Sepolia",
    "g": "Krijo një token dhe nise projektin final.",
    "w": 1,
    "need": [
      "MetaMask me Sepolia dhe ETH testimi",
      "Remix IDE"
    ],
    "steps": [
      [
        "Krijo MyToken.sol",
        "Ngjit kodin në file.",
        "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\nimport \"@openzeppelin/contracts/token/ERC20/ERC20.sol\";\n\ncontract MyToken is ERC20 {\n    constructor() ERC20(\"MyToken\", \"MTK\") {\n        _mint(msg.sender, 1000000 * 10 ** decimals());\n    }\n}"
      ],
      [
        "Provo në Remix VM",
        "Kompilo dhe deploy fillimisht në Remix VM."
      ],
      [
        "Kalo në Sepolia",
        "Environment: Injected Provider - MetaMask. Sigurohu që rrjeti është Sepolia."
      ],
      [
        "Deploy dhe konfirmo",
        "Konfirmo në MetaMask dhe kopjo adresën e contract-it."
      ],
      [
        "Importo tokenin",
        "MetaMask → Import tokens → ngjit adresën."
      ],
      [
        "Dërgo tokena te një koleg",
        "Pastaj kontrollo transaksionin në sepolia.etherscan.io."
      ],
      [
        "Nis projektin final",
        "Zgjidh idenë, krijo README me përshkrimin dhe plan për dy javët."
      ]
    ],
    "res": "Tokeni shfaqet në MetaMask me saldo prej 1,000,000 MTK.",
    "fail": [
      "Import nuk gjendet: kontrollo që është adresa e contract-it, jo e llogarisë.",
      "Deploy dështon: kontrollo që ke ETH testimi në Sepolia."
    ]
  }
];
export const levels = ["Fillestar", "Eksplorues", "Ndërtues", "Zhvillues", "Arkitekt", "Legjendë"];
export const levelThresholds = [0, 30, 70, 120, 180, 250];
export function levelFor(xp: number) { return Math.max(0, levelThresholds.findLastIndex(n => xp >= n)); }
export function stepReward(skipped: boolean) { return skipped ? 0 : 2; }
export function canOpen(index: number, completed: string[], unlocked: string[]) { return index === 0 || completed.includes(labs[index - 1]?.id ?? "") || unlocked.includes(labs[index]?.id ?? ""); }
