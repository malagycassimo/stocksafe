"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Camera, Upload, AlertTriangle, CheckCircle2, X, Thermometer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export function CheckinContent() {
  const router = useRouter()
  const [selectedPo, setSelectedPo] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [transportadora, setTransportadora] = useState("")
  const [placa, setPlaca] = useState("")
  const [motorista, setMotorista] = useState("")
  const [documento, setDocumento] = useState("")
  const [tipoVeiculo, setTipoVeiculo] = useState("")
  const [lacre, setLacre] = useState("")
  const [lacreIntegro, setLacreIntegro] = useState(false)
  const [temperatura, setTemperatura] = useState("")
  const [condicoesCarga, setCondicoesCarga] = useState("Boa")
  const [descricaoAvarias, setDescricaoAvarias] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const mockPOs = [
    {
      id: "PO-2025-001",
      supplier: "Fornecedor A",
      expectedDate: "2025-01-21",
      itemsCount: 2,
      status: "Aguardando Recebimento",
      isOverdue: false,
    },
    {
      id: "PO-2025-002",
      supplier: "Fornecedor B",
      expectedDate: "2025-01-22",
      itemsCount: 5,
      status: "Aguardando Recebimento",
      isOverdue: false,
    },
  ]

  const handleSelectPo = (po: any) => {
    setSelectedPo(po)
  }

  const handleScanLabel = () => {
    toast.info("Ativando câmera para scan...")
    // Simulate finding PO
    setTimeout(() => {
      handleSelectPo(mockPOs[0])
      toast.success("PO encontrado via etiqueta")
    }, 1000)
  }

  const validateTemperature = () => {
    const temp = Number.parseFloat(temperatura)
    if (isNaN(temp)) return null

    // Simulate product requirements
    const requiresRefrigerated = true // 2-8°C
    if (requiresRefrigerated) {
      if (temp >= 2 && temp <= 8) return "conforme"
      if (temp >= -2 && temp < 2) return "fora"
      if (temp > 8 && temp <= 12) return "fora"
      return "critico"
    }

    return "conforme"
  }

  const tempStatus = validateTemperature()

  const handleRegisterCheckin = () => {
    if (!transportadora || !placa) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (tempStatus === "critico") {
      setShowConfirmModal(true)
      return
    }

    completeCheckin()
  }

  const completeCheckin = () => {
    toast.success("Check-in registrado com sucesso!")
    setShowConfirmModal(false)

    // Ask if want to start inspection
    setTimeout(() => {
      if (confirm("Iniciar conferência agora?")) {
        router.push(`/recebimento/conferencia?po=${selectedPo.id}`)
      } else {
        router.push("/recebimento/aguardando")
      }
    }, 500)
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/recebimento" className="hover:text-imperial">
          Recebimento
        </Link>
        {" / "}
        <span className="text-foreground">Check-in</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-imperial">Check-in de Entrega</h1>
        <p className="text-muted-foreground mt-1">Registre a chegada do veículo</p>
      </div>

      {!selectedPo ? (
        /* PO Search */
        <Card>
          <CardHeader>
            <CardTitle>Buscar PO</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="numero">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="numero">Por Número do PO</TabsTrigger>
                <TabsTrigger value="scan">Por Scan da Etiqueta</TabsTrigger>
                <TabsTrigger value="fornecedor">Por Fornecedor</TabsTrigger>
              </TabsList>

              <TabsContent value="numero" className="space-y-4">
                <div>
                  <Label htmlFor="poSearch">Digite o número do PO</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="poSearch"
                      placeholder="PO-2025-001"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {mockPOs
                    .filter((po) => po.id.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((po) => (
                      <div
                        key={po.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectPo(po)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-mono font-medium">{po.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {po.supplier} • {po.itemsCount} itens • Previsto:{" "}
                              {new Date(po.expectedDate).toLocaleDateString("pt-BR")}
                            </div>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800">{po.status}</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="scan" className="space-y-4">
                <div className="text-center py-8">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <Button onClick={handleScanLabel} className="bg-imperial hover:bg-imperial">
                    <Camera className="w-4 h-4 mr-2" />
                    Ativar Câmera
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">ou</p>
                  <Input placeholder="Digite o código da etiqueta" className="mt-4 max-w-md mx-auto" />
                </div>
              </TabsContent>

              <TabsContent value="fornecedor" className="space-y-4">
                <div>
                  <Label htmlFor="supplierSelect">Selecionar fornecedor</Label>
                  <Select>
                    <SelectTrigger id="supplierSelect" className="mt-2">
                      <SelectValue placeholder="Escolha um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fa">Fornecedor A</SelectItem>
                      <SelectItem value="fb">Fornecedor B</SelectItem>
                      <SelectItem value="fc">Fornecedor C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        /* Checkin Form */
        <div className="space-y-6">
          {/* PO Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do PO (Resumo)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Nº PO</div>
                  <div className="font-mono font-medium">{selectedPo.id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Fornecedor</div>
                  <div className="font-medium">{selectedPo.supplier}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Data Prevista</div>
                  <div className="font-medium">{new Date(selectedPo.expectedDate).toLocaleDateString("pt-BR")}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Qtd de Itens</div>
                  <div className="font-medium">{selectedPo.itemsCount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <Badge className="bg-orange-100 text-orange-800">{selectedPo.status}</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 bg-transparent" onClick={() => setSelectedPo(null)}>
                <X className="w-4 h-4 mr-2" />
                Trocar PO
              </Button>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>
                    Data/Hora de Chegada <span className="text-red-500">*</span>
                  </Label>
                  <Input type="datetime-local" value={new Date().toISOString().slice(0, 16)} disabled />
                </div>

                <div>
                  <Label htmlFor="transportadora">
                    Transportadora <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="transportadora"
                    placeholder="Nome da transportadora"
                    value={transportadora}
                    onChange={(e) => setTransportadora(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="placa">
                    Placa do Veículo <span className="text-red-500">*</span>
                  </Label>
                  <Input id="placa" placeholder="AAA-0000" value={placa} onChange={(e) => setPlaca(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="motorista">Nome do Motorista</Label>
                  <Input
                    id="motorista"
                    placeholder="Nome completo"
                    value={motorista}
                    onChange={(e) => setMotorista(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documento">Documento do Motorista</Label>
                  <Input
                    id="documento"
                    placeholder="CPF, CNH ou RG"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="tipoVeiculo">Tipo de Veículo</Label>
                  <Select value={tipoVeiculo} onValueChange={setTipoVeiculo}>
                    <SelectTrigger id="tipoVeiculo">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="caminhao-bau">Caminhão Baú</SelectItem>
                      <SelectItem value="caminhao-refrigerado">Caminhão Refrigerado</SelectItem>
                      <SelectItem value="utilitario">Utilitário</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lacre">Lacre/Selo</Label>
                  <Input
                    id="lacre"
                    placeholder="Número do lacre"
                    value={lacre}
                    onChange={(e) => setLacre(e.target.value)}
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="lacreIntegro"
                      checked={lacreIntegro}
                      onCheckedChange={(checked) => setLacreIntegro(!!checked)}
                    />
                    <Label htmlFor="lacreIntegro" className="font-normal cursor-pointer">
                      Lacre íntegro
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="temperatura">Temperatura do Veículo (°C)</Label>
                  <div className="relative">
                    <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="temperatura"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 5.0"
                      value={temperatura}
                      onChange={(e) => setTemperatura(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {tempStatus && (
                    <div className="mt-2">
                      {tempStatus === "conforme" && (
                        <Badge className="bg-twilight text-imperial">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Conforme
                        </Badge>
                      )}
                      {tempStatus === "fora" && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Fora da Faixa
                        </Badge>
                      )}
                      {tempStatus === "critico" && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Crítico
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Condições Gerais da Carga</Label>
                <RadioGroup value={condicoesCarga} onValueChange={setCondicoesCarga} className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Boa" id="boa" />
                    <Label htmlFor="boa" className="font-normal cursor-pointer">
                      Boa (sem avarias visíveis)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Avarias leves" id="leves" />
                    <Label htmlFor="leves" className="font-normal cursor-pointer">
                      Avarias leves (descrever)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Avarias graves" id="graves" />
                    <Label htmlFor="graves" className="font-normal cursor-pointer">
                      Avarias graves (descrever)
                    </Label>
                  </div>
                </RadioGroup>

                {condicoesCarga !== "Boa" && (
                  <Textarea
                    placeholder="Descrição das avarias"
                    value={descricaoAvarias}
                    onChange={(e) => setDescricaoAvarias(e.target.value)}
                    className="mt-3"
                    rows={3}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="fotos">Upload de Fotos</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-imperial transition-colors cursor-pointer">
                  <input id="fotos" type="file" accept="image/*" multiple className="hidden" />
                  <label htmlFor="fotos" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Clique ou arraste fotos aqui</p>
                    <p className="text-xs text-muted-foreground mt-1">Veículo, lacre, condições da carga, termômetro</p>
                  </label>
                </div>
              </div>

              <div>
                <Label>Documentos Recebidos</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="nf" />
                    <Label htmlFor="nf" className="font-normal cursor-pointer">
                      Nota Fiscal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ct" />
                    <Label htmlFor="ct" className="font-normal cursor-pointer">
                      Conhecimento de Transporte
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="cs" />
                    <Label htmlFor="cs" className="font-normal cursor-pointer">
                      Certificado Sanitário
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="coa" />
                    <Label htmlFor="coa" className="font-normal cursor-pointer">
                      Datasheet/CoA
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="outros" />
                    <Label htmlFor="outros" className="font-normal cursor-pointer">
                      Outros
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações do Check-in</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações sobre a entrega, condições especiais, etc."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedPo(null)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button className="bg-imperial hover:bg-imperial" onClick={handleRegisterCheckin}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Registrar Check-in
            </Button>
          </div>
        </div>
      )}

      {/* Critical Conditions Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Condições Críticas Detectadas
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>Foram detectadas as seguintes condições críticas na entrega:</p>
              <ul className="list-disc list-inside space-y-1 text-red-600">
                {tempStatus === "critico" && <li>Temperatura fora da faixa aceitável</li>}
                {condicoesCarga === "Avarias graves" && <li>Avarias graves na carga</li>}
              </ul>
              <p className="pt-2">Deseja registrar Não Conformidade antes de iniciar a conferência?</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={completeCheckin}>
              Prosseguir com Conferência
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => toast.info("Abrindo formulário de NC...")}>
              Sim, Registrar NC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




