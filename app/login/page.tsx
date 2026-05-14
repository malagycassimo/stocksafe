"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, Eye, EyeOff, Package, User } from "lucide-react";
import { ForgotPasswordModal } from "@/components/forgot-password-modal";
import Image from "next/image";
import logoImage from "@/public/logo.svg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !profile) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor, insira um email válido");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      // Save profile to localStorage
      localStorage.setItem("userProfile", profile);

      // TODO: Implement actual login API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password, rememberMe, profile })
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      window.location.href = "/dashboard";
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-500 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border-2 border-white rounded-lg rotate-12" />
          <div className="absolute bottom-32 right-16 w-48 h-48 border-2 border-white rounded-lg -rotate-6" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 border-2 border-white rounded-lg rotate-45" />
        </div>

        <div className="relative z-10 text-center space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-white p-3 rounded-xl">
              <Image src={logoImage} alt="StockSafe Logo" className="w-12 h-12" />
            </div>
            <h1 className="text-5xl font-bold text-white">
              <span className="text-blue-700 mr-2">Gest</span>
              <span className="text-green-700">Stock</span>
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-2xl text-white font-medium max-w-md">
            Rastreabilidade Inteligente de Estoque
          </p>

          {/* Illustration */}
          <div className="mt-12 flex items-center justify-center gap-6">
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-24 bg-white rounded" />
                    <div className="h-2 w-16 bg-white/70 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-24 bg-white rounded" />
                    <div className="h-2 w-16 bg-white/70 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-24 bg-white rounded" />
                    <div className="h-2 w-16 bg-white/70 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="bg-white p-2 rounded-lg">
              <Image src={logoImage} alt="StockSafe Logo" className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-emerald-600">GestStock</h1>
          </div>

          {/* Form Card */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-emerald-600 text-center">
                Bem-vindo de volta
              </h2>
              <p className="text-muted-foreground text-center">
                Entre com suas credenciais para acessar o sistema
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Selection */}
              <div className="space-y-2">
                <Label htmlFor="profile" className="text-sm font-medium">
                  Perfil de Acesso
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                  <Select value={profile} onValueChange={setProfile}>
                    <SelectTrigger id="profile" className="pl-10 h-12 focus:ring-emerald-500">
                      <SelectValue placeholder="Selecione seu perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GERAL">Geral (Acesso Completo)</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="COMPRAS">Compras</SelectItem>
                      <SelectItem value="RECEBIMENTO">Recebimento/Armazém</SelectItem>
                      <SelectItem value="QA">Qualidade (QA)</SelectItem>
                      <SelectItem value="FINANCEIRO">Financeiro</SelectItem>
                      <SelectItem value="REQUISITANTE">Requisitante</SelectItem>
                      <SelectItem value="FORNECEDOR">Fornecedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 focus-visible:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 focus-visible:ring-emerald-500"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Lembrar-me neste dispositivo
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-base"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center pt-8">
            <p className="text-xs text-muted-foreground">
              © 2025 StockSafe. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
