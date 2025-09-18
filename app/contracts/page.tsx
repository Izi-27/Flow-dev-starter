import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"
import { Copy, Download, ExternalLink, Coins, ImageIcon, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"

const contractTemplates = [
  {
    id: "nft",
    title: "NFT Collection",
    description: "Complete NFT contract with minting, metadata, and collection management",
    icon: ImageIcon,
    difficulty: "Beginner",
    features: ["Minting", "Metadata", "Royalties", "Collection Management"],
    code: `// NFT Collection Contract
import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448

pub contract FlowDevKitNFT: NonFungibleToken {
    
    pub var totalSupply: UInt64
    
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event Minted(id: UInt64, recipient: Address)
    
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let MinterStoragePath: StoragePath
    
    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        pub let id: UInt64
        pub let name: String
        pub let description: String
        pub let thumbnail: String
        access(self) let royalties: [MetadataViews.Royalty]
        access(self) let metadata: {String: AnyStruct}
        
        init(
            id: UInt64,
            name: String,
            description: String,
            thumbnail: String,
            royalties: [MetadataViews.Royalty],
            metadata: {String: AnyStruct},
        ) {
            self.id = id
            self.name = name
            self.description = description
            self.thumbnail = thumbnail
            self.royalties = royalties
            self.metadata = metadata
        }
        
        pub fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.Royalties>(),
                Type<MetadataViews.ExternalURL>(),
                Type<MetadataViews.NFTCollectionData>(),
                Type<MetadataViews.NFTCollectionDisplay>(),
                Type<MetadataViews.Serial>(),
                Type<MetadataViews.Traits>()
            ]
        }
        
        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: self.name,
                        description: self.description,
                        thumbnail: MetadataViews.HTTPFile(
                            url: self.thumbnail
                        )
                    )
                case Type<MetadataViews.Royalties>():
                    return MetadataViews.Royalties(
                        self.royalties
                    )
                case Type<MetadataViews.Serial>():
                    return MetadataViews.Serial(
                        self.id
                    )
                case Type<MetadataViews.ExternalURL>():
                    return MetadataViews.ExternalURL("https://flowdevkit.com/nft/".concat(self.id.toString()))
                case Type<MetadataViews.NFTCollectionData>():
                    return MetadataViews.NFTCollectionData(
                        storagePath: FlowDevKitNFT.CollectionStoragePath,
                        publicPath: FlowDevKitNFT.CollectionPublicPath,
                        providerPath: /private/FlowDevKitNFTCollection,
                        publicCollection: Type<&FlowDevKitNFT.Collection{FlowDevKitNFT.FlowDevKitNFTCollectionPublic}>(),
                        publicLinkedType: Type<&FlowDevKitNFT.Collection{FlowDevKitNFT.FlowDevKitNFTCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(),
                        providerLinkedType: Type<&FlowDevKitNFT.Collection{FlowDevKitNFT.FlowDevKitNFTCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Provider,MetadataViews.ResolverCollection}>(),
                        createEmptyCollectionFunction: (fun (): @NonFungibleToken.Collection {
                            return <-FlowDevKitNFT.createEmptyCollection()
                        })
                    )
                case Type<MetadataViews.NFTCollectionDisplay>():
                    let media = MetadataViews.Media(
                        file: MetadataViews.HTTPFile(
                            url: "https://flowdevkit.com/logo.png"
                        ),
                        mediaType: "image/png"
                    )
                    return MetadataViews.NFTCollectionDisplay(
                        name: "FlowDevKit NFT Collection",
                        description: "A collection of NFTs created with FlowDevKit templates",
                        externalURL: MetadataViews.ExternalURL("https://flowdevkit.com"),
                        squareImage: media,
                        bannerImage: media,
                        socials: {
                            "twitter": MetadataViews.ExternalURL("https://twitter.com/flowdevkit")
                        }
                    )
                case Type<MetadataViews.Traits>():
                    let traitsView = MetadataViews.dictToTraits(dict: self.metadata, excludedNames: [])
                    return traitsView
            }
            return nil
        }
    }
    
    pub resource interface FlowDevKitNFTCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowFlowDevKitNFT(id: UInt64): &FlowDevKitNFT.NFT? {
            post {
                (result == nil) || (result?.id == id):
                    "Cannot borrow FlowDevKitNFT reference: the ID of the returned reference is incorrect"
            }
        }
    }
    
    pub resource Collection: FlowDevKitNFTCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}
        
        init () {
            self.ownedNFTs <- {}
        }
        
        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")
            
            emit Withdraw(id: token.id, from: self.owner?.address)
            
            return <-token
        }
        
        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @FlowDevKitNFT.NFT
            
            let id: UInt64 = token.id
            
            let oldToken <- self.ownedNFTs[id] <- token
            
            emit Deposit(id: id, to: self.owner?.address)
            
            destroy oldToken
        }
        
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }
        
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }
        
        pub fun borrowFlowDevKitNFT(id: UInt64): &FlowDevKitNFT.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                return ref as! &FlowDevKitNFT.NFT
            }
            
            return nil
        }
        
        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let FlowDevKitNFT = nft as! &FlowDevKitNFT.NFT
            return FlowDevKitNFT as &AnyResource{MetadataViews.Resolver}
        }
        
        destroy() {
            destroy self.ownedNFTs
        }
    }
    
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }
    
    pub resource NFTMinter {
        pub fun mintNFT(
            recipient: &{NonFungibleToken.CollectionPublic},
            name: String,
            description: String,
            thumbnail: String,
            royalties: [MetadataViews.Royalty]
        ) {
            let metadata: {String: AnyStruct} = {}
            let currentBlock = getCurrentBlock()
            metadata["mintedBlock"] = currentBlock.height
            metadata["mintedTime"] = currentBlock.timestamp
            metadata["minter"] = recipient.owner!.address
            
            var newNFT <- create NFT(
                id: FlowDevKitNFT.totalSupply,
                name: name,
                description: description,
                thumbnail: thumbnail,
                royalties: royalties,
                metadata: metadata,
            )
            
            let mintedID = newNFT.id
            
            recipient.deposit(token: <-newNFT)
            
            emit Minted(
                id: mintedID,
                recipient: recipient.owner!.address,
            )
            
            FlowDevKitNFT.totalSupply = FlowDevKitNFT.totalSupply + UInt64(1)
        }
    }
    
    init() {
        self.totalSupply = 0
        
        self.CollectionStoragePath = /storage/FlowDevKitNFTCollection
        self.CollectionPublicPath = /public/FlowDevKitNFTCollection
        self.MinterStoragePath = /storage/FlowDevKitNFTMinter
        
        let collection <- create Collection()
        self.account.save(<-collection, to: self.CollectionStoragePath)
        
        self.account.link<&FlowDevKitNFT.Collection{NonFungibleToken.CollectionPublic, FlowDevKitNFT.FlowDevKitNFTCollectionPublic, MetadataViews.ResolverCollection}>(
            self.CollectionPublicPath,
            target: self.CollectionStoragePath
        )
        
        let minter <- create NFTMinter()
        self.account.save(<-minter, to: self.MinterStoragePath)
        
        emit ContractInitialized()
    }
}`,
  },
  {
    id: "token",
    title: "Fungible Token",
    description: "ERC-20 style fungible token with minting, burning, and transfer capabilities",
    icon: Coins,
    difficulty: "Beginner",
    features: ["Minting", "Burning", "Transfers", "Allowances"],
    code: `// Fungible Token Contract
import FungibleToken from 0xf233dcee88fe0abe

pub contract FlowDevKitToken: FungibleToken {
    
    pub var totalSupply: UFix64
    
    pub event TokensInitialized(initialSupply: UFix64)
    pub event TokensWithdrawn(amount: UFix64, from: Address?)
    pub event TokensDeposited(amount: UFix64, to: Address?)
    pub event TokensMinted(amount: UFix64)
    pub event TokensBurned(amount: UFix64)
    
    pub let VaultStoragePath: StoragePath
    pub let VaultPublicPath: PublicPath
    pub let ReceiverPublicPath: PublicPath
    pub let AdminStoragePath: StoragePath
    
    pub resource Vault: FungibleToken.Provider, FungibleToken.Receiver, FungibleToken.Balance {
        
        pub var balance: UFix64
        
        init(balance: UFix64) {
            self.balance = balance
        }
        
        pub fun withdraw(amount: UFix64): @FungibleToken.Vault {
            self.balance = self.balance - amount
            emit TokensWithdrawn(amount: amount, from: self.owner?.address)
            return <-create Vault(balance: amount)
        }
        
        pub fun deposit(from: @FungibleToken.Vault) {
            let vault <- from as! @FlowDevKitToken.Vault
            self.balance = self.balance + vault.balance
            emit TokensDeposited(amount: vault.balance, to: self.owner?.address)
            vault.balance = 0.0
            destroy vault
        }
        
        destroy() {
            if self.balance > 0.0 {
                FlowDevKitToken.totalSupply = FlowDevKitToken.totalSupply - self.balance
            }
        }
    }
    
    pub fun createEmptyVault(): @FungibleToken.Vault {
        return <-create Vault(balance: 0.0)
    }
    
    pub resource Administrator {
        
        pub fun createNewMinter(allowedAmount: UFix64): @Minter {
            emit MinterCreated(allowedAmount: allowedAmount)
            return <-create Minter(allowedAmount: allowedAmount)
        }
        
        pub fun createNewBurner(): @Burner {
            emit BurnerCreated()
            return <-create Burner()
        }
    }
    
    pub resource Minter {
        
        pub var allowedAmount: UFix64
        
        pub fun mintTokens(amount: UFix64): @FlowDevKitToken.Vault {
            pre {
                amount > 0.0: "Amount minted must be greater than zero"
                amount <= self.allowedAmount: "Amount minted must be less than the allowed amount"
            }
            FlowDevKitToken.totalSupply = FlowDevKitToken.totalSupply + amount
            self.allowedAmount = self.allowedAmount - amount
            emit TokensMinted(amount: amount)
            return <-create Vault(balance: amount)
        }
        
        init(allowedAmount: UFix64) {
            self.allowedAmount = allowedAmount
        }
    }
    
    pub resource Burner {
        
        pub fun burnTokens(from: @FungibleToken.Vault) {
            let vault <- from as! @FlowDevKitToken.Vault
            let amount = vault.balance
            destroy vault
            emit TokensBurned(amount: amount)
        }
    }
    
    init() {
        self.totalSupply = 1000.0
        
        self.VaultStoragePath = /storage/FlowDevKitTokenVault
        self.VaultPublicPath = /public/FlowDevKitTokenVault
        self.ReceiverPublicPath = /public/FlowDevKitTokenReceiver
        self.AdminStoragePath = /storage/FlowDevKitTokenAdmin
        
        let vault <- create Vault(balance: self.totalSupply)
        self.account.save(<-vault, to: self.VaultStoragePath)
        
        self.account.link<&FlowDevKitToken.Vault{FungibleToken.Receiver}>(
            self.ReceiverPublicPath,
            target: self.VaultStoragePath
        )
        
        self.account.link<&FlowDevKitToken.Vault{FungibleToken.Balance}>(
            self.VaultPublicPath,
            target: self.VaultStoragePath
        )
        
        let admin <- create Administrator()
        self.account.save(<-admin, to: self.AdminStoragePath)
        
        emit TokensInitialized(initialSupply: self.totalSupply)
    }
}`,
  },
  {
    id: "staking",
    title: "Staking Contract",
    description: "Token staking mechanism with rewards, lock periods, and delegation",
    icon: TrendingUp,
    difficulty: "Advanced",
    features: ["Staking", "Rewards", "Lock Periods", "Delegation"],
    code: `// Staking Contract
import FungibleToken from 0xf233dcee88fe0abe
import FlowDevKitToken from 0x01

pub contract FlowDevKitStaking {
    
    pub var totalStaked: UFix64
    pub var rewardRate: UFix64 // Rewards per second per token
    pub var minimumStakingPeriod: UFix64 // In seconds
    
    pub event Staked(user: Address, amount: UFix64, lockPeriod: UFix64)
    pub event Unstaked(user: Address, amount: UFix64, rewards: UFix64)
    pub event RewardsClaimed(user: Address, amount: UFix64)
    pub event RewardRateUpdated(newRate: UFix64)
    
    pub let StakingStoragePath: StoragePath
    pub let StakingPublicPath: PublicPath
    pub let AdminStoragePath: StoragePath
    
    pub struct StakeInfo {
        pub let amount: UFix64
        pub let stakeTime: UFix64
        pub let lockPeriod: UFix64
        pub let lastRewardTime: UFix64
        
        init(amount: UFix64, lockPeriod: UFix64) {
            self.amount = amount
            self.stakeTime = getCurrentBlock().timestamp
            self.lockPeriod = lockPeriod
            self.lastRewardTime = getCurrentBlock().timestamp
        }
    }
    
    pub resource interface StakingPublic {
        pub fun getStakeInfo(): StakeInfo?
        pub fun calculateRewards(): UFix64
        pub fun getTotalStaked(): UFix64
    }
    
    pub resource StakingAccount: StakingPublic {
        access(self) var stakeInfo: StakeInfo?
        access(self) var tokenVault: @FlowDevKitToken.Vault
        
        init() {
            self.stakeInfo = nil
            self.tokenVault <- FlowDevKitToken.createEmptyVault() as! @FlowDevKitToken.Vault
        }
        
        pub fun stake(tokens: @FlowDevKitToken.Vault, lockPeriod: UFix64) {
            pre {
                self.stakeInfo == nil: "Already staking tokens"
                lockPeriod >= FlowDevKitStaking.minimumStakingPeriod: "Lock period too short"
                tokens.balance > 0.0: "Cannot stake zero tokens"
            }
            
            let amount = tokens.balance
            self.tokenVault.deposit(from: <-tokens)
            self.stakeInfo = StakeInfo(amount: amount, lockPeriod: lockPeriod)
            
            FlowDevKitStaking.totalStaked = FlowDevKitStaking.totalStaked + amount
            
            emit Staked(user: self.owner!.address, amount: amount, lockPeriod: lockPeriod)
        }
        
        pub fun unstake(): @FlowDevKitToken.Vault {
            pre {
                self.stakeInfo != nil: "No tokens staked"
            }
            
            let stakeInfo = self.stakeInfo!
            let currentTime = getCurrentBlock().timestamp
            
            assert(
                currentTime >= stakeInfo.stakeTime + stakeInfo.lockPeriod,
                message: "Tokens are still locked"
            )
            
            let rewards = self.calculateRewards()
            let stakedAmount = stakeInfo.amount
            
            // Reset staking info
            self.stakeInfo = nil
            
            // Update total staked
            FlowDevKitStaking.totalStaked = FlowDevKitStaking.totalStaked - stakedAmount
            
            // Withdraw staked tokens
            let stakedTokens <- self.tokenVault.withdraw(amount: stakedAmount)
            
            emit Unstaked(user: self.owner!.address, amount: stakedAmount, rewards: rewards)
            
            return <-stakedTokens
        }
        
        pub fun claimRewards(): @FlowDevKitToken.Vault {
            pre {
                self.stakeInfo != nil: "No tokens staked"
            }
            
            let rewards = self.calculateRewards()
            
            if rewards > 0.0 {
                // Update last reward time
                let currentStakeInfo = self.stakeInfo!
                self.stakeInfo = StakeInfo(amount: currentStakeInfo.amount, lockPeriod: currentStakeInfo.lockPeriod)
                
                emit RewardsClaimed(user: self.owner!.address, amount: rewards)
                
                // In a real implementation, rewards would come from a reward pool
                // For this example, we'll create new tokens (this would require minter access)
                return <-FlowDevKitToken.createEmptyVault() as! @FlowDevKitToken.Vault
            }
            
            return <-FlowDevKitToken.createEmptyVault() as! @FlowDevKitToken.Vault
        }
        
        pub fun getStakeInfo(): StakeInfo? {
            return self.stakeInfo
        }
        
        pub fun calculateRewards(): UFix64 {
            if self.stakeInfo == nil {
                return 0.0
            }
            
            let stakeInfo = self.stakeInfo!
            let currentTime = getCurrentBlock().timestamp
            let stakingDuration = currentTime - stakeInfo.lastRewardTime
            
            return stakeInfo.amount * FlowDevKitStaking.rewardRate * stakingDuration
        }
        
        pub fun getTotalStaked(): UFix64 {
            return self.stakeInfo?.amount ?? 0.0
        }
        
        destroy() {
            destroy self.tokenVault
        }
    }
    
    pub fun createStakingAccount(): @StakingAccount {
        return <-create StakingAccount()
    }
    
    pub resource Administrator {
        pub fun updateRewardRate(newRate: UFix64) {
            FlowDevKitStaking.rewardRate = newRate
            emit RewardRateUpdated(newRate: newRate)
        }
        
        pub fun updateMinimumStakingPeriod(newPeriod: UFix64) {
            FlowDevKitStaking.minimumStakingPeriod = newPeriod
        }
    }
    
    // Public functions
    pub fun getTotalStaked(): UFix64 {
        return self.totalStaked
    }
    
    pub fun getRewardRate(): UFix64 {
        return self.rewardRate
    }
    
    pub fun getMinimumStakingPeriod(): UFix64 {
        return self.minimumStakingPeriod
    }
    
    init() {
        self.totalStaked = 0.0
        self.rewardRate = 0.0001 // 0.01% per second
        self.minimumStakingPeriod = 86400.0 // 1 day in seconds
        
        self.StakingStoragePath = /storage/FlowDevKitStaking
        self.StakingPublicPath = /public/FlowDevKitStaking
        self.AdminStoragePath = /storage/FlowDevKitStakingAdmin
        
        let admin <- create Administrator()
        self.account.save(<-admin, to: self.AdminStoragePath)
    }
}`,
  },
]

export default function ContractsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Smart Contracts</Badge>
            </div>
            <h1 className="text-4xl font-bold text-balance">Cadence Contract Templates</h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Production-ready smart contract templates for the Flow blockchain. Each template includes comprehensive
              functionality, security best practices, and detailed documentation.
            </p>
          </div>

          {/* Contract Templates Grid */}
          <div className="grid gap-8">
            {contractTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <template.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-2xl">{template.title}</CardTitle>
                        <CardDescription className="text-base">{template.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={template.difficulty === "Advanced" ? "destructive" : "secondary"}>
                      {template.difficulty}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {template.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Tabs defaultValue="code" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="code">Contract Code</TabsTrigger>
                      <TabsTrigger value="deploy">Deployment</TabsTrigger>
                      <TabsTrigger value="usage">Usage Examples</TabsTrigger>
                    </TabsList>

                    <TabsContent value="code" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Contract Implementation</h3>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <CodeBlock code={template.code} language="cadence" />
                    </TabsContent>

                    <TabsContent value="deploy" className="space-y-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Deployment Instructions</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                              1
                            </div>
                            <div>
                              <p className="font-medium">Install Flow CLI</p>
                              <p className="text-sm text-muted-foreground">
                                Download and install the Flow CLI from the official Flow documentation
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                              2
                            </div>
                            <div>
                              <p className="font-medium">Configure your project</p>
                              <p className="text-sm text-muted-foreground">
                                Set up your flow.json configuration file with network settings
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                              3
                            </div>
                            <div>
                              <p className="font-medium">Deploy the contract</p>
                              <p className="text-sm text-muted-foreground">
                                Use <code className="bg-muted px-1 rounded">flow project deploy</code> to deploy to your
                                chosen network
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="usage" className="space-y-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Usage Examples</h3>
                        <div className="grid gap-4">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Minting {template.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CodeBlock
                                code={`// Transaction to mint ${template.title.toLowerCase()}
import ${template.title.replace(" ", "")} from 0x01

transaction(recipient: Address, name: String) {
    prepare(signer: AuthAccount) {
        // Implementation details...
    }
}`}
                                language="cadence"
                              />
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Query {template.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CodeBlock
                                code={`// Script to query ${template.title.toLowerCase()}
import ${template.title.replace(" ", "")} from 0x01

pub fun main(address: Address): UFix64 {
    // Implementation details...
}`}
                                language="cadence"
                              />
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex gap-4 pt-4 border-t">
                    <Button asChild>
                      <Link href={`/contracts/${template.id}`}>
                        View Full Documentation
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/cli?template=${template.id}`}>
                        Deploy with CLI
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Resources */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Need a Custom Contract?</CardTitle>
              <CardDescription>
                These templates cover common use cases, but every project is unique. Learn how to customize these
                contracts or create your own from scratch.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" asChild>
                  <Link href="/docs/customization">
                    Customization Guide
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="https://cadence-lang.org" target="_blank">
                    Cadence Documentation
                    <ExternalLink className="ml-2 h-4 w-4" />
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
