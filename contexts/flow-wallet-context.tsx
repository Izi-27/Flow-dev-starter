"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import * as fcl from "@onflow/fcl"
import { initializeFlow } from "@/lib/flow-config"

// Flow wallet types
interface FlowUser {
  addr: string
  loggedIn: boolean
}

interface FlowWalletContextType {
  user: FlowUser | null
  isLoading: boolean
  login: () => Promise<void>
  logout: () => void
  authenticate: () => Promise<void>
}

const FlowWalletContext = createContext<FlowWalletContextType | undefined>(undefined)

export function FlowWalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FlowUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeFlow()

    const unsubscribe = fcl.currentUser.subscribe((currentUser: any) => {
      if (currentUser.loggedIn) {
        setUser({
          addr: currentUser.addr,
          loggedIn: true,
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async () => {
    setIsLoading(true)
    try {
      await fcl.authenticate()
    } catch (error) {
      console.error("Login failed:", error)
      setIsLoading(false)
    }
  }

  const logout = () => {
    fcl.unauthenticate()
  }

  const authenticate = async () => {
    if (!user?.loggedIn) {
      await login()
    }
  }

  return (
    <FlowWalletContext.Provider value={{ user, isLoading, login, logout, authenticate }}>
      {children}
    </FlowWalletContext.Provider>
  )
}

export function useFlowWallet() {
  const context = useContext(FlowWalletContext)
  if (context === undefined) {
    throw new Error("useFlowWallet must be used within a FlowWalletProvider")
  }
  return context
}
