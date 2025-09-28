# FlowDevKit CLI Tools

Powerful CLI scripts to deploy contracts, interact with the blockchain, and manage your Flow applications. One-command deployment and interaction tools for faster development.

## Prerequisites

Before using these scripts, you must install the [Flow CLI](https://developers.flow.com/build/cadence/getting-started/flow-cli). All scripts are compatible with emulator, testnet, and mainnet.

## Installation & Setup

Get started with FlowDevKit CLI tools in minutes.

### 1. Install Flow CLI

```bash
# Install Flow CLI
curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh | sh

# Verify installation
flow version
```

### 2. Download FlowDevKit Scripts

```bash
# Clone FlowDevKit CLI tools
git clone https://github.com/flowdevkit/cli-tools.git
cd cli-tools

# Make scripts executable
chmod +x *.sh
```

### 3. Initialize Project

```bash
# Initialize new Flow project
flow init

# Or use FlowDevKit template
./init-project.sh my-flow-app
```

### 4. Deploy Your First Contract

```bash
# Deploy NFT contract to testnet
./deploy-nft.sh testnet MyNFT

# Deploy token contract
./deploy-token.sh testnet MyToken 1000000
```

## Features & Available Scripts

The CLI tools are organized into the following categories:

### Contract Deployment

Deploy smart contracts to Flow networks with a single command.

#### `deploy-nft.sh`

*   **Description**: Deploy NFT contract to testnet or mainnet.
*   **Usage**:
    ```bash
    # Make script executable
    chmod +x deploy-nft.sh
    
    # Run with default parameters (deploys to testnet)
    ./deploy-nft.sh
    
    # Run with custom parameters
    ./deploy-nft.sh [network] [contract-name]
    ```

#### `deploy-token.sh`

*   **Description**: Deploy fungible token contract.
*   **Usage**:
    ```bash
    # Make script executable
    chmod +x deploy-token.sh
    
    # Run with default parameters
    ./deploy-token.sh
    
    # Run with custom parameters
    ./deploy-token.sh [network] [token-name] [initial-supply]
    ```

### Contract Interaction

Scripts to interact with deployed contracts - mint, transfer, query.

#### `mint-nft.sh`

*   **Description**: Mint NFTs from deployed contract.
*   **Usage**:
    ```bash
    # Mint an NFT with default values
    ./mint-nft.sh

    # Mint an NFT with custom values
    ./mint-nft.sh [network] [recipient] [name] [description] [image-url]
    ```

#### `setup-collection.sh`

*   **Description**: Set up NFT collection for an account.
*   **Usage**:
    ```bash
    # Setup collection for the default testnet account
    ./setup-collection.sh

    # Setup collection for a specific account on a network
    ./setup-collection.sh [network] [account]
    ```

### Query Scripts

Read blockchain state - balances, NFT metadata, contract info.

#### `get-balance.cdc`

*   **Description**: Query token balance for an account.
*   **Usage**: `flow scripts execute ./get-balance.cdc <account-address> --network=testnet`

#### `get-nft-ids.cdc`

*   **Description**: Get all NFT IDs owned by an account.
*   **Usage**: `flow scripts execute ./get-nft-ids.cdc <account-address> --network=testnet`

#### `get-nft-metadata.cdc`

*   **Description**: Get detailed metadata for a specific NFT.
*   **Usage**: `flow scripts execute ./get-nft-metadata.cdc <account-address> <item-id> --network=testnet`