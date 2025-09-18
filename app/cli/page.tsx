import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Terminal, Download, Play, Zap, FileText, ArrowRight, CheckCircle, AlertCircle, Info } from "lucide-react"
import Link from "next/link"

const cliTools = [
  {
    id: "deploy",
    title: "Contract Deployment",
    description: "Deploy smart contracts to Flow networks with a single command",
    icon: Zap,
    category: "Deployment",
    scripts: [
      {
        name: "deploy-nft.sh",
        description: "Deploy NFT contract to testnet or mainnet",
        code: `#!/bin/bash

# FlowDevKit NFT Deployment Script
# Usage: ./deploy-nft.sh [network] [contract-name]

set -e

NETWORK=\${1:-testnet}
CONTRACT_NAME=\${2:-FlowDevKitNFT}

echo "🚀 Deploying $CONTRACT_NAME to $NETWORK..."

# Check if Flow CLI is installed
if ! command -v flow &> /dev/null; then
    echo "❌ Flow CLI is not installed. Please install it first:"
    echo "   curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh | sh"
    exit 1
fi

# Check if flow.json exists
if [ ! -f "flow.json" ]; then
    echo "❌ flow.json not found. Initializing project..."
    flow init
fi

# Create contracts directory if it doesn't exist
mkdir -p contracts

# Download NFT contract template if it doesn't exist
if [ ! -f "contracts/$CONTRACT_NAME.cdc" ]; then
    echo "📥 Downloading NFT contract template..."
    curl -s https://raw.githubusercontent.com/flowdevkit/templates/main/contracts/NFT.cdc > "contracts/$CONTRACT_NAME.cdc"
fi

# Update flow.json with contract configuration
echo "⚙️  Configuring flow.json..."
cat > flow.json << EOF
{
  "contracts": {
    "$CONTRACT_NAME": "./contracts/$CONTRACT_NAME.cdc"
  },
  "networks": {
    "emulator": "127.0.0.1:3569",
    "testnet": "access.devnet.nodes.onflow.org:9000",
    "mainnet": "access.mainnet.nodes.onflow.org:9000"
  },
  "accounts": {
    "emulator-account": {
      "address": "f8d6e0586b0a20c7",
      "key": "2eae2f31cb5b756151fa11d82949c634b8f28796a711d7eb1e52cc301ed11111"
    }
  },
  "deployments": {
    "$NETWORK": {
      "emulator-account": ["$CONTRACT_NAME"]
    }
  }
}
EOF

# Deploy the contract
echo "📦 Deploying contract to $NETWORK..."
if [ "$NETWORK" = "emulator" ]; then
    # Start emulator if not running
    if ! pgrep -f "flow emulator" > /dev/null; then
        echo "🔧 Starting Flow emulator..."
        flow emulator start --verbose &
        sleep 5
    fi
fi

flow project deploy --network=$NETWORK

echo "✅ Successfully deployed $CONTRACT_NAME to $NETWORK!"
echo ""
echo "📋 Next steps:"
echo "   1. Verify deployment: flow accounts get <account-address> --network=$NETWORK"
echo "   2. Mint your first NFT: ./mint-nft.sh $NETWORK"
echo "   3. Set up collection: ./setup-collection.sh $NETWORK"`,
      },
      {
        name: "deploy-token.sh",
        description: "Deploy fungible token contract",
        code: `#!/bin/bash

# FlowDevKit Token Deployment Script
# Usage: ./deploy-token.sh [network] [token-name] [initial-supply]

set -e

NETWORK=\${1:-testnet}
TOKEN_NAME=\${2:-FlowDevKitToken}
INITIAL_SUPPLY=\${3:-1000000.0}

echo "🪙 Deploying $TOKEN_NAME to $NETWORK with initial supply: $INITIAL_SUPPLY..."

# Validate initial supply is a number
if ! [[ "$INITIAL_SUPPLY" =~ ^[0-9]+\.?[0-9]*$ ]]; then
    echo "❌ Initial supply must be a valid number"
    exit 1
fi

# Check Flow CLI installation
if ! command -v flow &> /dev/null; then
    echo "❌ Flow CLI not found. Install with:"
    echo "   curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh | sh"
    exit 1
fi

# Create project structure
mkdir -p contracts transactions scripts

# Download token contract template
if [ ! -f "contracts/$TOKEN_NAME.cdc" ]; then
    echo "📥 Downloading token contract template..."
    curl -s https://raw.githubusercontent.com/flowdevkit/templates/main/contracts/Token.cdc > "contracts/$TOKEN_NAME.cdc"
    
    # Replace placeholder values
    sed -i "s/FlowDevKitToken/$TOKEN_NAME/g" "contracts/$TOKEN_NAME.cdc"
    sed -i "s/1000.0/$INITIAL_SUPPLY/g" "contracts/$TOKEN_NAME.cdc"
fi

# Configure flow.json
cat > flow.json << EOF
{
  "contracts": {
    "$TOKEN_NAME": "./contracts/$TOKEN_NAME.cdc"
  },
  "networks": {
    "emulator": "127.0.0.1:3569",
    "testnet": "access.devnet.nodes.onflow.org:9000",
    "mainnet": "access.mainnet.nodes.onflow.org:9000"
  },
  "accounts": {
    "emulator-account": {
      "address": "f8d6e0586b0a20c7",
      "key": "2eae2f31cb5b756151fa11d82949c634b8f28796a711d7eb1e52cc301ed11111"
    }
  },
  "deployments": {
    "$NETWORK": {
      "emulator-account": ["$TOKEN_NAME"]
    }
  }
}
EOF

# Start emulator for local deployment
if [ "$NETWORK" = "emulator" ]; then
    if ! pgrep -f "flow emulator" > /dev/null; then
        echo "🔧 Starting Flow emulator..."
        flow emulator start --verbose &
        sleep 5
    fi
fi

# Deploy contract
echo "📦 Deploying $TOKEN_NAME..."
flow project deploy --network=$NETWORK

# Create basic transaction templates
echo "📝 Creating transaction templates..."

cat > transactions/setup_vault.cdc << EOF
import FungibleToken from 0xf233dcee88fe0abe
import $TOKEN_NAME from 0x01

transaction {
    prepare(signer: AuthAccount) {
        if signer.borrow<&$TOKEN_NAME.Vault>(from: $TOKEN_NAME.VaultStoragePath) == nil {
            signer.save(<-$TOKEN_NAME.createEmptyVault(), to: $TOKEN_NAME.VaultStoragePath)
            signer.link<&$TOKEN_NAME.Vault{FungibleToken.Receiver}>(
                $TOKEN_NAME.ReceiverPublicPath,
                target: $TOKEN_NAME.VaultStoragePath
            )
            signer.link<&$TOKEN_NAME.Vault{FungibleToken.Balance}>(
                $TOKEN_NAME.VaultPublicPath,
                target: $TOKEN_NAME.VaultStoragePath
            )
        }
    }
}
EOF

cat > transactions/transfer_tokens.cdc << EOF
import FungibleToken from 0xf233dcee88fe0abe
import $TOKEN_NAME from 0x01

transaction(amount: UFix64, to: Address) {
    let vault: &$TOKEN_NAME.Vault
    
    prepare(signer: AuthAccount) {
        self.vault = signer.borrow<&$TOKEN_NAME.Vault>(from: $TOKEN_NAME.VaultStoragePath)
            ?? panic("Could not borrow reference to the owner's Vault!")
    }
    
    execute {
        let recipient = getAccount(to)
        let receiverRef = recipient.getCapability($TOKEN_NAME.ReceiverPublicPath)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")
        
        let sentVault <- self.vault.withdraw(amount: amount)
        receiverRef.deposit(from: <-sentVault)
    }
}
EOF

echo "✅ Successfully deployed $TOKEN_NAME!"
echo ""
echo "📋 Available commands:"
echo "   Setup vault: flow transactions send ./transactions/setup_vault.cdc --network=$NETWORK"
echo "   Transfer tokens: flow transactions send ./transactions/transfer_tokens.cdc 100.0 0x01 --network=$NETWORK"
echo "   Check balance: flow scripts execute ./scripts/get_balance.cdc 0x01 --network=$NETWORK"`,
      },
    ],
  },
  {
    id: "interact",
    title: "Contract Interaction",
    description: "Scripts to interact with deployed contracts - mint, transfer, query",
    icon: Play,
    category: "Interaction",
    scripts: [
      {
        name: "mint-nft.sh",
        description: "Mint NFTs from deployed contract",
        code: `#!/bin/bash

# FlowDevKit NFT Minting Script
# Usage: ./mint-nft.sh [network] [recipient] [name] [description] [image-url]

set -e

NETWORK=\${1:-testnet}
RECIPIENT=\${2:-0x01}
NFT_NAME=\${3:-"FlowDevKit NFT #1"}
DESCRIPTION=\${4:-"A beautiful NFT created with FlowDevKit"}
IMAGE_URL=\${5:-"https://flowdevkit.com/nft-placeholder.png"}

echo "🎨 Minting NFT: '$NFT_NAME' to $RECIPIENT on $NETWORK..."

# Create mint transaction if it doesn't exist
mkdir -p transactions

cat > transactions/mint_nft.cdc << EOF
import NonFungibleToken from 0x1d7e57aa55817448
import FlowDevKitNFT from 0x01
import MetadataViews from 0x1d7e57aa55817448

transaction(
    recipient: Address,
    name: String,
    description: String,
    thumbnail: String,
) {
    let minter: &FlowDevKitNFT.NFTMinter
    
    prepare(signer: AuthAccount) {
        self.minter = signer.borrow<&FlowDevKitNFT.NFTMinter>(from: FlowDevKitNFT.MinterStoragePath)
            ?? panic("Could not borrow a reference to the NFT minter")
    }
    
    execute {
        let recipient = getAccount(recipient)
        let receiver = recipient
            .getCapability(FlowDevKitNFT.CollectionPublicPath)
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not get receiver reference to the NFT Collection")
        
        let royalties: [MetadataViews.Royalty] = []
        
        self.minter.mintNFT(
            recipient: receiver,
            name: name,
            description: description,
            thumbnail: thumbnail,
            royalties: royalties
        )
    }
}
EOF

# Execute the minting transaction
echo "📦 Executing mint transaction..."
flow transactions send ./transactions/mint_nft.cdc \\
    --arg Address:"$RECIPIENT" \\
    --arg String:"$NFT_NAME" \\
    --arg String:"$DESCRIPTION" \\
    --arg String:"$IMAGE_URL" \\
    --network=$NETWORK

echo "✅ Successfully minted NFT!"
echo ""
echo "🔍 Verify the mint:"
echo "   flow scripts execute ./scripts/get_nft_ids.cdc $RECIPIENT --network=$NETWORK"`,
      },
      {
        name: "setup-collection.sh",
        description: "Set up NFT collection for an account",
        code: `#!/bin/bash

# FlowDevKit Collection Setup Script
# Usage: ./setup-collection.sh [network] [account]

set -e

NETWORK=\${1:-testnet}
ACCOUNT=\${2:-emulator-account}

echo "📁 Setting up NFT collection for $ACCOUNT on $NETWORK..."

# Create setup transaction
mkdir -p transactions

cat > transactions/setup_collection.cdc << EOF
import NonFungibleToken from 0x1d7e57aa55817448
import FlowDevKitNFT from 0x01
import MetadataViews from 0x1d7e57aa55817448

transaction {
    prepare(signer: AuthAccount) {
        if signer.borrow<&FlowDevKitNFT.Collection>(from: FlowDevKitNFT.CollectionStoragePath) != nil {
            log("Collection already exists!")
            return
        }
        
        let collection <- FlowDevKitNFT.createEmptyCollection()
        signer.save(<-collection, to: FlowDevKitNFT.CollectionStoragePath)
        
        signer.link<&FlowDevKitNFT.Collection{NonFungibleToken.CollectionPublic, FlowDevKitNFT.FlowDevKitNFTCollectionPublic, MetadataViews.ResolverCollection}>(
            FlowDevKitNFT.CollectionPublicPath,
            target: FlowDevKitNFT.CollectionStoragePath
        )
        
        log("Collection setup complete!")
    }
}
EOF

# Execute setup transaction
echo "📦 Setting up collection..."
flow transactions send ./transactions/setup_collection.cdc \\
    --signer=$ACCOUNT \\
    --network=$NETWORK

echo "✅ Collection setup complete!"
echo ""
echo "🔍 Verify setup:"
echo "   flow scripts execute ./scripts/check_collection.cdc <account-address> --network=$NETWORK"`,
      },
    ],
  },
  {
    id: "query",
    title: "Query Scripts",
    description: "Read blockchain state - balances, NFT metadata, contract info",
    icon: FileText,
    category: "Query",
    scripts: [
      {
        name: "get-balance.cdc",
        description: "Query token balance for an account",
        code: `// Get Token Balance Script
import FungibleToken from 0xf233dcee88fe0abe
import FlowDevKitToken from 0x01

pub fun main(account: Address): UFix64 {
    let vaultRef = getAccount(account)
        .getCapability(FlowDevKitToken.VaultPublicPath)
        .borrow<&FlowDevKitToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}`,
      },
      {
        name: "get-nft-ids.cdc",
        description: "Get all NFT IDs owned by an account",
        code: `// Get NFT IDs Script
import NonFungibleToken from 0x1d7e57aa55817448
import FlowDevKitNFT from 0x01

pub fun main(account: Address): [UInt64] {
    let collectionRef = getAccount(account)
        .getCapability(FlowDevKitNFT.CollectionPublicPath)
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")
    
    return collectionRef.getIDs()
}`,
      },
      {
        name: "get-nft-metadata.cdc",
        description: "Get detailed metadata for a specific NFT",
        code: `// Get NFT Metadata Script
import NonFungibleToken from 0x1d7e57aa55817448
import FlowDevKitNFT from 0x01
import MetadataViews from 0x1d7e57aa55817448

pub struct NFTMetadata {
    pub let id: UInt64
    pub let name: String
    pub let description: String
    pub let thumbnail: String
    pub let owner: Address
    pub let royalties: [MetadataViews.Royalty]

    init(
        id: UInt64,
        name: String,
        description: String,
        thumbnail: String,
        owner: Address,
        royalties: [MetadataViews.Royalty]
    ) {
        self.id = id
        self.name = name
        self.description = description
        self.thumbnail = thumbnail
        self.owner = owner
        self.royalties = royalties
    }
}

pub fun main(account: Address, itemID: UInt64): NFTMetadata? {
    let collectionRef = getAccount(account)
        .getCapability(FlowDevKitNFT.CollectionPublicPath)
        .borrow<&{MetadataViews.ResolverCollection}>()
        ?? panic("Could not borrow capability from collection")
    
    let nft = collectionRef.borrowViewResolver(id: itemID)
    
    if let display = MetadataViews.getDisplay(nft) {
        let royalties = MetadataViews.getRoyalties(nft) ?? []
        
        return NFTMetadata(
            id: itemID,
            name: display.name,
            description: display.description,
            thumbnail: display.thumbnail.uri(),
            owner: account,
            royalties: royalties.getRoyalties()
        )
    }
    
    return nil
}`,
      },
    ],
  },
]

export default function CLIPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">CLI Tools</Badge>
            </div>
            <h1 className="text-4xl font-bold text-balance">Command Line Interface</h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Powerful CLI scripts to deploy contracts, interact with the blockchain, and manage your Flow applications.
              One-command deployment and interaction tools for faster development.
            </p>
          </div>

          {/* Quick Start */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Prerequisites:</strong> Install the{" "}
              <Link href="https://docs.onflow.org/flow-cli/install/" className="text-primary hover:underline">
                Flow CLI
              </Link>{" "}
              before using these scripts. All scripts are compatible with emulator, testnet, and mainnet.
            </AlertDescription>
          </Alert>

          {/* CLI Tools */}
          <div className="space-y-8">
            {cliTools.map((tool) => (
              <Card key={tool.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <tool.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl">{tool.title}</CardTitle>
                        <Badge variant="outline">{tool.category}</Badge>
                      </div>
                      <CardDescription className="text-base">{tool.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="0" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      {tool.scripts.map((script, index) => (
                        <TabsTrigger key={index} value={index.toString()}>
                          {script.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {tool.scripts.map((script, index) => (
                      <TabsContent key={index} value={index.toString()} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{script.name}</h3>
                            <p className="text-sm text-muted-foreground">{script.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>

                        <CodeBlock code={script.code} language="bash" />

                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Usage Example
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CodeBlock
                                code={`# Make script executable
chmod +x ${script.name}

# Run with default parameters
./${script.name}

# Run with custom parameters
./${script.name} testnet MyContract 1000000`}
                                language="bash"
                              />
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                Common Issues
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <div>
                                <strong>Permission denied:</strong> Run{" "}
                                <code className="bg-muted px-1 rounded">chmod +x script.sh</code>
                              </div>
                              <div>
                                <strong>Flow CLI not found:</strong> Install from{" "}
                                <Link
                                  href="https://docs.onflow.org/flow-cli/install/"
                                  className="text-primary hover:underline"
                                >
                                  official docs
                                </Link>
                              </div>
                              <div>
                                <strong>Network issues:</strong> Check your internet connection and network
                                configuration
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Installation Guide */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Installation & Setup
              </CardTitle>
              <CardDescription>Get started with FlowDevKit CLI tools in minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">1. Install Flow CLI</h3>
                  <CodeBlock
                    code={`# Install Flow CLI
curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh | sh

# Verify installation
flow version`}
                    language="bash"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">2. Download FlowDevKit Scripts</h3>
                  <CodeBlock
                    code={`# Clone FlowDevKit CLI tools
git clone https://github.com/flowdevkit/cli-tools.git
cd cli-tools

# Make scripts executable
chmod +x *.sh`}
                    language="bash"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">3. Initialize Project</h3>
                  <CodeBlock
                    code={`# Initialize new Flow project
flow init

# Or use FlowDevKit template
./init-project.sh my-flow-app`}
                    language="bash"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">4. Deploy Your First Contract</h3>
                  <CodeBlock
                    code={`# Deploy NFT contract to testnet
./deploy-nft.sh testnet MyNFT

# Deploy token contract
./deploy-token.sh testnet MyToken 1000000`}
                    language="bash"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button asChild>
                  <Link href="https://github.com/flowdevkit/cli-tools">
                    <Download className="mr-2 h-4 w-4" />
                    Download CLI Tools
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/docs/cli">
                    Full CLI Documentation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
