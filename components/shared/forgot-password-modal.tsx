"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mail, CheckCircle2 } from "lucide-react"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Por favor, insira seu email")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor, insira um email válido")
      return
    }

    setIsLoading(true)

    try {
      // TODO: Implement actual forgot password API call
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSuccess(true)
      console.log("[v0] Password reset requested for:", email)
    } catch (err) {
      setError("Erro ao enviar link. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    setError("")
    setIsSuccess(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-twilight p-3 rounded-full">
                  <Mail className="w-8 h-8 text-imperial" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">Recuperar Senha</DialogTitle>
              <DialogDescription className="text-center">
                Digite seu email e enviaremos um link para redefinir sua senha
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu.email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 focus-visible:ring-imperial"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Button type="submit" className="w-full h-11 bg-imperial hover:bg-imperial" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar Link"}
                </Button>
                <Button type="button" variant="ghost" className="w-full h-11" onClick={handleClose}>
                  Cancelar
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-twilight p-3 rounded-full">
                  <CheckCircle2 className="w-8 h-8 text-imperial" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">Link Enviado!</DialogTitle>
              <DialogDescription className="text-center">
                Verifique seu email para redefinir sua senha. O link expira em 1 hora.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6">
              <Button onClick={handleClose} className="w-full h-11 bg-imperial hover:bg-imperial">
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}




