import * as fcl from "@onflow/fcl"

export const initializeFlow = () => {
  fcl.config({
    "accessNode.api": process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || "https://rest-testnet.onflow.org",
    "discovery.wallet":
      process.env.NEXT_PUBLIC_FLOW_WALLET_DISCOVERY || "https://fcl-discovery.onflow.org/testnet/authn",
    "discovery.authn.endpoint":
      process.env.NEXT_PUBLIC_FLOW_WALLET_DISCOVERY || "https://fcl-discovery.onflow.org/testnet/authn",
    "app.detail.title": "FlowDevKit",
    "app.detail.icon": "https://flowdevkit.vercel.app/favicon.ico",
    "service.OpenID.scopes": "email email_verified name zoneinfo",
    "fcl.limit": 9999,
  })
}

// Flow contract addresses for testnet
export const FLOW_CONTRACTS = {
  FlowToken: "0x7e60df042a9c0868",
  FungibleToken: "0x9a0766d93b6608b7",
  NonFungibleToken: "0x631e88ae7f1d7c20",
  MetadataViews: "0x631e88ae7f1d7c20",
}

// Helper function to get user's Flow balance
export const getUserFlowBalance = async (address: string) => {
  try {
    const response = await fcl.query({
      cadence: `
        import FlowToken from 0x7e60df042a9c0868
        import FungibleToken from 0x9a0766d93b6608b7

        pub fun main(address: Address): UFix64 {
          let account = getAccount(address)
          let vaultRef = account.getCapability(/public/flowTokenBalance)
            .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
            ?? panic("Could not borrow Balance reference to the Vault")
          
          return vaultRef.balance
        }
      `,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    })
    return response
  } catch (error) {
    console.error("Error fetching Flow balance:", error)
    return "0.0"
  }
}
