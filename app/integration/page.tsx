import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Code2, Zap, Database, ArrowRight, Download, ExternalLink, Info, CheckCircle } from "lucide-react"
import Link from "next/link"

const integrationSections = [
  {
    id: "hooks",
    title: "React Hooks",
    description: "Custom hooks for wallet connection, authentication, and blockchain interactions",
    icon: Code2,
    examples: [
      {
        name: "useFlowWallet",
        description: "Connect and manage Flow wallet connections",
        code: `// hooks/useFlowWallet.ts
import { useState, useEffect, useCallback } from 'react'
import * as fcl from '@onflow/fcl'

export interface FlowUser {
  addr: string | null
  cid: string | null
  loggedIn: boolean
  services: any[]
}

export function useFlowWallet() {
  const [user, setUser] = useState<FlowUser>({
    addr: null,
    cid: null,
    loggedIn: false,
    services: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Configure FCL
    fcl.config({
      'accessNode.api': process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || 'https://rest-testnet.onflow.org',
      'discovery.wallet': process.env.NEXT_PUBLIC_FLOW_WALLET_DISCOVERY || 'https://fcl-discovery.onflow.org/testnet/authn',
      'app.detail.title': 'FlowDevKit App',
      'app.detail.icon': 'https://flowdevkit.com/logo.png',
    })

    // Subscribe to user changes
    const unsubscribe = fcl.currentUser.subscribe(setUser)
    return () => unsubscribe()
  }, [])

  const login = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await fcl.authenticate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await fcl.unauthenticate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signMessage = useCallback(async (message: string) => {
    if (!user.loggedIn) {
      throw new Error('User not authenticated')
    }
    
    try {
      const signature = await fcl.currentUser.signUserMessage(message)
      return signature
    } catch (err) {
      throw new Error('Failed to sign message')
    }
  }, [user.loggedIn])

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    signMessage,
    isAuthenticated: user.loggedIn
  }
}`,
      },
      {
        name: "useFlowTransaction",
        description: "Execute transactions and track their status",
        code: `// hooks/useFlowTransaction.ts
import { useState, useCallback } from 'react'
import * as fcl from '@onflow/fcl'

export interface TransactionStatus {
  status: 'idle' | 'pending' | 'success' | 'error'
  txId: string | null
  error: string | null
  blockId: string | null
}

export function useFlowTransaction() {
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>({
    status: 'idle',
    txId: null,
    error: null,
    blockId: null
  })

  const executeTransaction = useCallback(async (
    code: string,
    args: any[] = [],
    limit: number = 1000
  ) => {
    setTransactionStatus({
      status: 'pending',
      txId: null,
      error: null,
      blockId: null
    })

    try {
      const txId = await fcl.mutate({
        cadence: code,
        args: (arg: any, t: any) => args.map(a => arg(a.value, a.type)),
        limit
      })

      setTransactionStatus(prev => ({
        ...prev,
        txId
      }))

      // Subscribe to transaction status
      const unsubscribe = fcl.tx(txId).subscribe((res: any) => {
        if (res.status === 4) { // Transaction sealed
          setTransactionStatus({
            status: 'success',
            txId,
            error: null,
            blockId: res.blockId
          })
          unsubscribe()
        } else if (res.status === 5) { // Transaction expired
          setTransactionStatus({
            status: 'error',
            txId,
            error: 'Transaction expired',
            blockId: null
          })
          unsubscribe()
        }
      })

      return txId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed'
      setTransactionStatus({
        status: 'error',
        txId: null,
        error: errorMessage,
        blockId: null
      })
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    setTransactionStatus({
      status: 'idle',
      txId: null,
      error: null,
      blockId: null
    })
  }, [])

  return {
    transactionStatus,
    executeTransaction,
    reset,
    isLoading: transactionStatus.status === 'pending',
    isSuccess: transactionStatus.status === 'success',
    isError: transactionStatus.status === 'error'
  }
}`,
      },
      {
        name: "useFlowScript",
        description: "Execute read-only scripts to query blockchain state",
        code: `// hooks/useFlowScript.ts
import { useState, useCallback, useEffect } from 'react'
import * as fcl from '@onflow/fcl'

export function useFlowScript<T = any>(
  script: string,
  args: any[] = [],
  options: {
    enabled?: boolean
    refetchInterval?: number
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeScript = useCallback(async (scriptCode?: string, scriptArgs?: any[]) => {
    const codeToExecute = scriptCode || script
    const argsToUse = scriptArgs || args

    if (!codeToExecute) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await fcl.query({
        cadence: codeToExecute,
        args: (arg: any, t: any) => argsToUse.map(a => arg(a.value, a.type))
      })
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Script execution failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [script, args])

  // Auto-execute if enabled
  useEffect(() => {
    if (options.enabled !== false && script) {
      executeScript()
    }
  }, [executeScript, options.enabled, script])

  // Set up refetch interval
  useEffect(() => {
    if (options.refetchInterval && options.enabled !== false) {
      const interval = setInterval(() => {
        executeScript()
      }, options.refetchInterval)

      return () => clearInterval(interval)
    }
  }, [executeScript, options.refetchInterval, options.enabled])

  const refetch = useCallback(() => executeScript(), [executeScript])

  return {
    data,
    isLoading,
    error,
    refetch,
    executeScript
  }
}`,
      },
    ],
  },
  {
    id: "components",
    title: "React Components",
    description: "Pre-built UI components for common Flow blockchain interactions",
    icon: Wallet,
    examples: [
      {
        name: "WalletConnect",
        description: "Wallet connection button with status display",
        code: `// components/WalletConnect.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, LogOut, Loader2 } from 'lucide-react'
import { useFlowWallet } from '@/hooks/useFlowWallet'

interface WalletConnectProps {
  className?: string
  showDetails?: boolean
}

export function WalletConnect({ className, showDetails = false }: WalletConnectProps) {
  const { user, isLoading, error, login, logout, isAuthenticated } = useFlowWallet()

  if (showDetails && isAuthenticated) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Connected Wallet
          </CardTitle>
          <CardDescription>
            Your Flow wallet is connected and ready to use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address:</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {user.addr?.slice(0, 8)}...{user.addr?.slice(-6)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant="default">Connected</Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            disabled={isLoading}
            className="w-full bg-transparent"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            Disconnect
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Button
      onClick={isAuthenticated ? logout : login}
      disabled={isLoading}
      className={className}
      variant={isAuthenticated ? "outline" : "default"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Wallet className="h-4 w-4 mr-2" />
      )}
      {isAuthenticated ? 'Disconnect' : 'Connect Wallet'}
    </Button>
  )
}`,
      },
      {
        name: "NFTBalance",
        description: "Display NFT collection with metadata",
        code: `// components/NFTBalance.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageIcon, ExternalLink } from 'lucide-react'
import { useFlowScript } from '@/hooks/useFlowScript'
import { useFlowWallet } from '@/hooks/useFlowWallet'

interface NFT {
  id: string
  name: string
  description: string
  thumbnail: string
  owner: string
}

interface NFTBalanceProps {
  contractAddress: string
  contractName: string
  className?: string
}

export function NFTBalance({ contractAddress, contractName, className }: NFTBalanceProps) {
  const { user, isAuthenticated } = useFlowWallet()
  const [nfts, setNfts] = useState<NFT[]>([])

  // Script to get NFT IDs
  const getNFTIdsScript = \`
    import NonFungibleToken from 0x1d7e57aa55817448
    import \${contractName} from \${contractAddress}

    pub fun main(account: Address): [UInt64] {
        let collectionRef = getAccount(account)
            .getCapability(\${contractName}.CollectionPublicPath)
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not borrow capability from public collection")
        
        return collectionRef.getIDs()
    }
  \`

  const { 
    data: nftIds, 
    isLoading: loadingIds, 
    refetch: refetchIds 
  } = useFlowScript<string[]>(
    getNFTIdsScript,
    isAuthenticated && user.addr ? [{ value: user.addr, type: 'Address' }] : [],
    { enabled: isAuthenticated && !!user.addr }
  )

  // Script to get NFT metadata
  const getNFTMetadataScript = \`
    import NonFungibleToken from 0x1d7e57aa55817448
    import \${contractName} from \${contractAddress}
    import MetadataViews from 0x1d7e57aa55817448

    pub fun main(account: Address, itemID: UInt64): NFTMetadata? {
        let collectionRef = getAccount(account)
            .getCapability(\${contractName}.CollectionPublicPath)
            .borrow<&{MetadataViews.ResolverCollection}>()
            ?? panic("Could not borrow capability from collection")
        
        let nft = collectionRef.borrowViewResolver(id: itemID)
        
        if let display = MetadataViews.getDisplay(nft) {
            return NFTMetadata(
                id: itemID,
                name: display.name,
                description: display.description,
                thumbnail: display.thumbnail.uri(),
                owner: account
            )
        }
        
        return nil
    }
  \`

  // Fetch NFT metadata when IDs are available
  useEffect(() => {
    if (nftIds && nftIds.length > 0 && user.addr) {
      const fetchNFTMetadata = async () => {
        const nftPromises = nftIds.map(async (id) => {
          try {
            // In a real implementation, you'd use the useFlowScript hook
            // This is simplified for the example
            return {
              id,
              name: \`NFT #\${id}\`,
              description: 'A beautiful NFT from FlowDevKit',
              thumbnail: '/digital-art-collection.png',
              owner: user.addr!
            }
          } catch (error) {
            console.error(\`Failed to fetch NFT \${id}:\`, error)
            return null
          }
        })

        const results = await Promise.all(nftPromises)
        setNfts(results.filter(Boolean) as NFT[])
      }

      fetchNFTMetadata()
    }
  }, [nftIds, user.addr])

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            NFT Collection
          </CardTitle>
          <CardDescription>
            Connect your wallet to view your NFT collection
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (loadingIds) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            NFT Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              NFT Collection
            </CardTitle>
            <CardDescription>
              {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} in your collection
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refetchIds}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {nfts.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No NFTs found in your collection</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {nfts.map((nft) => (
              <Card key={nft.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={nft.thumbnail || "/placeholder.svg"}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h4 className="font-semibold text-sm truncate">{nft.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {nft.description}
                  </p>
                  <Badge variant="secondary" className="text-xs mt-2">
                    #{nft.id}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}`,
      },
      {
        name: "TokenBalance",
        description: "Display fungible token balance with transfer functionality",
        code: `// components/TokenBalance.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Coins, Send, Loader2 } from 'lucide-react'
import { useFlowScript } from '@/hooks/useFlowScript'
import { useFlowTransaction } from '@/hooks/useFlowTransaction'
import { useFlowWallet } from '@/hooks/useFlowWallet'

interface TokenBalanceProps {
  contractAddress: string
  contractName: string
  tokenSymbol: string
  className?: string
}

export function TokenBalance({ 
  contractAddress, 
  contractName, 
  tokenSymbol, 
  className 
}: TokenBalanceProps) {
  const { user, isAuthenticated } = useFlowWallet()
  const [transferAmount, setTransferAmount] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [showTransfer, setShowTransfer] = useState(false)

  // Script to get token balance
  const getBalanceScript = \`
    import FungibleToken from 0xf233dcee88fe0abe
    import \${contractName} from \${contractAddress}

    pub fun main(account: Address): UFix64 {
        let vaultRef = getAccount(account)
            .getCapability(\${contractName}.VaultPublicPath)
            .borrow<&\${contractName}.Vault{FungibleToken.Balance}>()
            ?? panic("Could not borrow Balance reference to the Vault")

        return vaultRef.balance
    }
  \`

  const { 
    data: balance, 
    isLoading: loadingBalance, 
    refetch: refetchBalance 
  } = useFlowScript<number>(
    getBalanceScript,
    isAuthenticated && user.addr ? [{ value: user.addr, type: 'Address' }] : [],
    { enabled: isAuthenticated && !!user.addr, refetchInterval: 10000 }
  )

  // Transfer transaction
  const transferTransaction = \`
    import FungibleToken from 0xf233dcee88fe0abe
    import \${contractName} from \${contractAddress}

    transaction(amount: UFix64, to: Address) {
        let vault: &\${contractName}.Vault
        
        prepare(signer: AuthAccount) {
            self.vault = signer.borrow<&\${contractName}.Vault>(from: \${contractName}.VaultStoragePath)
                ?? panic("Could not borrow reference to the owner's Vault!")
        }
        
        execute {
            let recipient = getAccount(to)
            let receiverRef = recipient.getCapability(\${contractName}.ReceiverPublicPath)
                .borrow<&{FungibleToken.Receiver}>()
                ?? panic("Could not borrow receiver reference to the recipient's Vault")
            
            let sentVault <- self.vault.withdraw(amount: amount)
            receiverRef.deposit(from: <-sentVault)
        }
    }
  \`

  const { executeTransaction, transactionStatus, reset } = useFlowTransaction()

  const handleTransfer = async () => {
    if (!transferAmount || !recipientAddress) return

    try {
      await executeTransaction(
        transferTransaction,
        [
          { value: transferAmount, type: 'UFix64' },
          { value: recipientAddress, type: 'Address' }
        ]
      )
      
      // Reset form on success
      setTransferAmount('')
      setRecipientAddress('')
      setShowTransfer(false)
      
      // Refetch balance
      setTimeout(() => refetchBalance(), 2000)
    } catch (error) {
      console.error('Transfer failed:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            {tokenSymbol} Balance
          </CardTitle>
          <CardDescription>
            Connect your wallet to view your token balance
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              {tokenSymbol} Balance
            </CardTitle>
            <CardDescription>
              Your current token balance
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refetchBalance}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-4">
          {loadingBalance ? (
            <Skeleton className="h-8 w-32 mx-auto" />
          ) : (
            <div className="space-y-2">
              <div className="text-3xl font-bold">
                {balance?.toLocaleString() || '0'}
              </div>
              <Badge variant="secondary">{tokenSymbol}</Badge>
            </div>
          )}
        </div>

        {!showTransfer ? (
          <Button 
            onClick={() => setShowTransfer(true)} 
            className="w-full"
            disabled={!balance || balance === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Tokens
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleTransfer}
                disabled={!transferAmount || !recipientAddress || transactionStatus.status === 'pending'}
                className="flex-1"
              >
                {transactionStatus.status === 'pending' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowTransfer(false)
                  reset()
                }}
              >
                Cancel
              </Button>
            </div>
            {transactionStatus.error && (
              <p className="text-sm text-destructive">{transactionStatus.error}</p>
            )}
            {transactionStatus.status === 'success' && (
              <p className="text-sm text-green-600">Transfer successful!</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}`,
      },
    ],
  },
  {
    id: "examples",
    title: "Integration Examples",
    description: "Complete examples showing how to integrate Flow into your React applications",
    icon: Database,
    examples: [
      {
        name: "Complete App Setup",
        description: "Full application setup with FCL configuration",
        code: `// app/layout.tsx
import { FlowProvider } from '@/components/FlowProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <FlowProvider>
          {children}
        </FlowProvider>
      </body>
    </html>
  )
}

// components/FlowProvider.tsx
'use client'

import { useEffect } from 'react'
import * as fcl from '@onflow/fcl'

interface FlowProviderProps {
  children: React.ReactNode
}

export function FlowProvider({ children }: FlowProviderProps) {
  useEffect(() => {
    fcl.config({
      'accessNode.api': process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || 'https://rest-testnet.onflow.org',
      'discovery.wallet': process.env.NEXT_PUBLIC_FLOW_WALLET_DISCOVERY || 'https://fcl-discovery.onflow.org/testnet/authn',
      'app.detail.title': 'FlowDevKit App',
      'app.detail.icon': 'https://flowdevkit.com/logo.png',
      'service.OpenID.scopes': 'email email_verified name zoneinfo',
    })
  }, [])

  return <>{children}</>
}`,
      },
      {
        name: "NFT Marketplace",
        description: "Example NFT marketplace with listing and purchasing",
        code: `// components/NFTMarketplace.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useFlowWallet } from '@/hooks/useFlowWallet'
import { useFlowTransaction } from '@/hooks/useFlowTransaction'
import { useFlowScript } from '@/hooks/useFlowScript'

interface NFTListing {
  id: string
  name: string
  description: string
  image: string
  price: number
  seller: string
}

export function NFTMarketplace() {
  const { isAuthenticated } = useFlowWallet()
  const [listingPrice, setListingPrice] = useState('')
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null)

  // Script to get marketplace listings
  const getListingsScript = \`
    import NFTMarketplace from 0x01

    pub fun main(): [NFTListing] {
        return NFTMarketplace.getListings()
    }
  \`

  const { data: listings, isLoading } = useFlowScript<NFTListing[]>(
    getListingsScript,
    [],
    { enabled: true, refetchInterval: 30000 }
  )

  // Transaction to list NFT
  const listNFTTransaction = \`
    import NFTMarketplace from 0x01
    import FlowDevKitNFT from 0x01

    transaction(nftID: UInt64, price: UFix64) {
        prepare(signer: AuthAccount) {
            let collection = signer.borrow<&FlowDevKitNFT.Collection>(
                from: FlowDevKitNFT.CollectionStoragePath
            ) ?? panic("Could not borrow collection")
            
            let nft <- collection.withdraw(withdrawID: nftID)
            NFTMarketplace.listNFT(nft: <-nft, price: price)
        }
    }
  \`

  // Transaction to purchase NFT
  const purchaseNFTTransaction = \`
    import NFTMarketplace from 0x01
    import FlowToken from 0x1654653399040a61

    transaction(listingID: UInt64) {
        prepare(signer: AuthAccount) {
            let vault = signer.borrow<&FlowToken.Vault>(
                from: /storage/flowTokenVault
            ) ?? panic("Could not borrow Flow token vault")
            
            NFTMarketplace.purchaseNFT(listingID: listingID, payment: <-vault)
        }
    }
  \`

  const { executeTransaction: listNFT } = useFlowTransaction()
  const { executeTransaction: purchaseNFT } = useFlowTransaction()

  const handleListNFT = async () => {
    if (!selectedNFT || !listingPrice) return

    try {
      await listNFT(listNFTTransaction, [
        { value: selectedNFT, type: 'UInt64' },
        { value: listingPrice, type: 'UFix64' }
      ])
    } catch (error) {
      console.error('Failed to list NFT:', error)
    }
  }

  const handlePurchaseNFT = async (listingId: string) => {
    try {
      await purchaseNFT(purchaseNFTTransaction, [
        { value: listingId, type: 'UInt64' }
      ])
    } catch (error) {
      console.error('Failed to purchase NFT:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NFT Marketplace</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Connect your wallet to access the marketplace
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>List Your NFT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="NFT ID"
            value={selectedNFT || ''}
            onChange={(e) => setSelectedNFT(e.target.value)}
          />
          <Input
            placeholder="Price (FLOW)"
            value={listingPrice}
            onChange={(e) => setListingPrice(e.target.value)}
          />
          <Button onClick={handleListNFT} className="w-full">
            List NFT
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings?.map((listing) => (
          <Card key={listing.id}>
            <div className="aspect-square relative">
              <img
                src={listing.image || "/placeholder.svg"}
                alt={listing.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{listing.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {listing.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {listing.price} FLOW
                </Badge>
                <Button
                  size="sm"
                  onClick={() => handlePurchaseNFT(listing.id)}
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}`,
      },
    ],
  },
]

export default function IntegrationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Frontend Integration</Badge>
            </div>
            <h1 className="text-4xl font-bold text-balance">React Integration Guide</h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              React hooks, components, and examples for seamless Flow blockchain integration. Connect wallets, execute
              transactions, and query blockchain state with ease.
            </p>
          </div>

          {/* Prerequisites */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Prerequisites:</strong> Install <code className="bg-muted px-1 rounded">@onflow/fcl</code> and{" "}
              <code className="bg-muted px-1 rounded">@onflow/types</code> in your React project.{" "}
              <Link href="#installation" className="text-primary hover:underline">
                See installation guide below.
              </Link>
            </AlertDescription>
          </Alert>

          {/* Integration Sections */}
          <div className="space-y-8">
            {integrationSections.map((section) => (
              <Card key={section.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <section.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-2xl">{section.title}</CardTitle>
                      <CardDescription className="text-base">{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="0" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      {section.examples.map((example, index) => (
                        <TabsTrigger key={index} value={index.toString()}>
                          {example.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {section.examples.map((example, index) => (
                      <TabsContent key={index} value={index.toString()} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{example.name}</h3>
                            <p className="text-sm text-muted-foreground">{example.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>

                        <CodeBlock code={example.code} language="typescript" />

                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Key Features
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              {section.id === "hooks" && (
                                <>
                                  <div>• TypeScript support with full type safety</div>
                                  <div>• Automatic error handling and loading states</div>
                                  <div>• React hooks pattern for easy integration</div>
                                  <div>• Configurable options and callbacks</div>
                                </>
                              )}
                              {section.id === "components" && (
                                <>
                                  <div>• Pre-built UI components with shadcn/ui</div>
                                  <div>• Responsive design and accessibility</div>
                                  <div>• Customizable styling and behavior</div>
                                  <div>• Real-time data updates</div>
                                </>
                              )}
                              {section.id === "examples" && (
                                <>
                                  <div>• Complete application examples</div>
                                  <div>• Production-ready code patterns</div>
                                  <div>• Error handling and edge cases</div>
                                  <div>• Performance optimizations</div>
                                </>
                              )}
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Usage Example</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CodeBlock
                                code={`// Import and use in your component
import { ${example.name} } from '@/components/${example.name}'

export function MyApp() {
  return (
    <div>
      <${example.name} 
        contractAddress="0x01"
        contractName="FlowDevKitNFT"
      />
    </div>
  )
}`}
                                language="typescript"
                              />
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
          <Card id="installation" className="bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Installation & Setup
              </CardTitle>
              <CardDescription>Get started with Flow integration in your React app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">1. Install Dependencies</h3>
                  <CodeBlock
                    code={`# Install Flow Client Library
npm install @onflow/fcl @onflow/types

# Install UI components (optional)
npm install @radix-ui/react-* class-variance-authority`}
                    language="bash"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">2. Environment Variables</h3>
                  <CodeBlock
                    code={`# .env.local
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
NEXT_PUBLIC_FLOW_WALLET_DISCOVERY=https://fcl-discovery.onflow.org/testnet/authn`}
                    language="bash"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">3. Configure FCL</h3>
                  <CodeBlock
                    code={`// lib/flow.ts
import * as fcl from '@onflow/fcl'

fcl.config({
  'accessNode.api': process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE,
  'discovery.wallet': process.env.NEXT_PUBLIC_FLOW_WALLET_DISCOVERY,
  'app.detail.title': 'Your App Name',
  'app.detail.icon': 'https://yourapp.com/logo.png',
})`}
                    language="typescript"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">4. Add to Your App</h3>
                  <CodeBlock
                    code={`// app/page.tsx
import { WalletConnect } from '@/components/WalletConnect'
import { NFTBalance } from '@/components/NFTBalance'

export default function Home() {
  return (
    <div className="space-y-6">
      <WalletConnect showDetails />
      <NFTBalance 
        contractAddress="0x01" 
        contractName="FlowDevKitNFT" 
      />
    </div>
  )
}`}
                    language="typescript"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button asChild>
                  <Link href="https://github.com/flowdevkit/react-integration">
                    <Download className="mr-2 h-4 w-4" />
                    Download Complete Example
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/docs/integration">
                    Full Integration Docs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="https://docs.onflow.org/fcl/" target="_blank">
                    FCL Documentation
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
