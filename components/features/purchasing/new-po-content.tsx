"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { recebimentoService } from "@/app/services/recebimentoService"
import { fornecedorService, type FornecedorData } from "@/app/services/fornecedorService"

export function NewPoContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suppliers, setSuppliers] = useState<FornecedorData[]>([])

  // Form Fields
  const [codigo, setCodigo] = useState("")
  const [fornecedorId, setFornecedorId] = useState("")
  const [totalValue, setTotalValue] = useState("")
  const [expectedDelivery, setExpectedDelivery] = useState("")
  const [propostaId, setPropostaId] = useState("")

  // Auto-generate code on mount
  useEffect(() => {
    const year = new Date().getFullYear()
    const rand = Math.floor(1000 + Math.random() * 9000)
    setCodigo(`PO-${year}-${rand}`)
  }, [])

  // Load suppliers
  useEffect(() => {
    let active = true
    fornecedorService.listarTodos()
      .then((data) => {
        if (!active) return
        setSuppliers(data || [])
        setLoadingSuppliers(false)
      })
      .catch((err) => {
        console.error("Erro ao carregar fornecedores:", err)
        if (!active) return
        setLoadingSuppliers(false)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível buscar a lista de fornecedores.",
          variant: "destructive"
        })
      })

    return () => {
      active = false
    }
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigo.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, preencha o código do Pedido de Compra.",
        variant: "destructive"
      })
      return
    }

    if (!fornecedorId) {
      toast({
        title: "Fornecedor obrigatório",
        description: "Por favor, selecione o fornecedor correspondente.",
        variant: "destructive"
      })
      return
    }

    if (!totalValue || parseFloat(totalValue) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, preencha um valor total válido para a PO.",
        variant: "destructive"
      })
      return
    }

    if (!expectedDelivery) {
      toast({
        title: "Data de entrega obrigatória",
        description: "Por favor, selecione a data estimada de entrega.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      await recebimentoService.createPurchaseOrder({
        codigo,
        fornecedorId,
        totalValue: parseFloat(totalValue),
        expectedDelivery,
        propostaId: propostaId || undefined
      })

      toast({
        title: "PO Criada com Sucesso!",
        description: `Pedido ${codigo} foi emitido e registrado.`
      })

      router.push("/compras/pos")
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Erro ao criar PO",
        description: err.response?.data?.message || err.message || "Erro desconhecido.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/compras/pos" className="hover:text-foreground">Compras</Link>
            <span>/</span>
            <span className="text-foreground">Novo PO</span>
          </div>
          <h1 className="text-3xl font-bold text-imperial">Novo Pedido de Compra</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/compras/pos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Pedido de Compra</CardTitle>
          <CardDescription>Crie uma ordem de compra para entrega física posterior no armazém</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código do PO *</Label>
                <Input
                  id="codigo"
                  placeholder="PO-2026-XXXX"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor *</Label>
                <Select value={fornecedorId} onValueChange={setFornecedorId}>
                  <SelectTrigger id="fornecedor" disabled={loadingSuppliers}>
                    <SelectValue placeholder={loadingSuppliers ? "Carregando..." : "Selecione o fornecedor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((sup) => (
                      <SelectItem key={sup.id} value={sup.id!}>
                        {sup.razao_social} {sup.nome_fantasia ? `(${sup.nome_fantasia})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="totalValue">Valor Total (MT) *</Label>
                <Input
                  id="totalValue"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDelivery">Previsão de Entrega *</Label>
                <Input
                  id="expectedDelivery"
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposta">Proposta Comercial ID (Opcional)</Label>
              <Input
                id="proposta"
                placeholder="Identificador da proposta vinculada"
                value={propostaId}
                onChange={(e) => setPropostaId(e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/compras/pos">Cancelar</Link>
              </Button>
              <Button className="bg-imperial hover:bg-imperial" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando PO...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar e Emitir PO
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
