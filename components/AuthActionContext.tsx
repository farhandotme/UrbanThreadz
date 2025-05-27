"use client"
import { createContext, useContext, useState, ReactNode } from "react"
import AuthModal from "@/components/ui/AuthModal"
import { useSession } from "next-auth/react"

interface AuthActionContextType {
  openAuthModal: (action?: () => void) => void
  closeAuthModal: () => void
  runOrQueueAction: (action: () => void) => void
}

const AuthActionContext = createContext<AuthActionContextType | undefined>(undefined)

export function useAuthAction() {
  const ctx = useContext(AuthActionContext)
  if (!ctx) throw new Error("useAuthAction must be used within AuthActionProvider")
  return ctx
}

export function AuthActionProvider({ children }: { children: ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null)
  const { data: session } = useSession()

  // If user logs in and there is a pending action, run it
  if (session && pendingAction) {
    pendingAction()
    setPendingAction(null)
    setIsAuthModalOpen(false)
  }

  const openAuthModal = (action?: () => void) => {
    setIsAuthModalOpen(true)
    if (action) setPendingAction(() => action)
  }
  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
    setPendingAction(null)
  }
  const runOrQueueAction = (action: () => void) => {
    if (session) {
      action()
    } else {
      openAuthModal(action)
    }
  }

  return (
    <AuthActionContext.Provider value={{ openAuthModal, closeAuthModal, runOrQueueAction }}>
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      {children}
    </AuthActionContext.Provider>
  )
}
