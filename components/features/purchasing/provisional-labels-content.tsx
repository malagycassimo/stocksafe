"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Printer, Download, ArrowLeft, Copy, Mail, RefreshCw, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export function ProvisionalLabelsContent() {
  const params = useParams()
  const router = useRouter()
  const poId = params.id as string

  const [selectedLabels, setSelectedLabels] = useState<number[]>([])
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailTo, setEmailTo] = useState("fornecedor@example.com")
  const [emailSubject, setEmailSubject] = useState(`Etiquetas Provisórias - PO #${poId}`)
  const [emailMessage, setEmailMessage] = useState(
    `Prezado fornecedor,\n\nSegue em anexo as etiquetas provisórias para o PO #${poId}.\n\nPor favor, identifique os lotes correspondentes e cole as etiquetas nos documentos de acompanhamento da mercadoria.\n\nAtenciosamente,\nEquipe StockSafe`,
  )
  const [expandedTechnical, setExpandedTechnical] = useState<number[]>([])

  const labels = [
    {
      id: 1,
      code: "PROV-2025-001-001",
      product: "PRD-001 - Produto Teste A",
      quantity: "100 UN",
      lot: "L2025-001",
      expiry: "2025-12-30",
      barcode: "(01)07891234567890(10)L2025-001(17)251230",
      status: "Gerada",
    },
    {
      id: 2,
      code: "PROV-2025-001-002",
      product: "PRD-002 - Produto Teste B",
      quantity: "50 KG",
      lot: "L2025-002",
      expiry: "2026-06-15",
      barcode: "(01)07891234567891(10)L2025-002(17)260615",
      status: "Gerada",
    },
  ]

  const printHistory = [
    {
      date: "2025-01-30 14:35",
      user: "João Silva",
      labels: "2 etiquetas",
      printer: "Zebra ZD420",
      status: "Sucesso",
    },
  ]

  const toggleLabel = (id: number) => {
    setSelectedLabels((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selectedLabels.length === labels.length) {
      setSelectedLabels([])
    } else {
      setSelectedLabels(labels.map((l) => l.id))
    }
  }

  const handlePrintSelected = () => {
    if (selectedLabels.length === 0) {
      toast.error("Selecione pelo menos uma etiqueta")
      return
    }
    toast.success(`${selectedLabels.length} etiqueta(s) enviada(s) para impressão`)
  }

  const handleDownloadSelected = () => {
    if (selectedLabels.length === 0) {
      toast.error("Selecione pelo menos uma etiqueta")
      return
    }
    toast.success(`Download de ${selectedLabels.length} etiqueta(s) iniciado`)
  }

  const handleSendEmail = () => {
    if (selectedLabels.length === 0) {
      toast.error("Selecione pelo menos uma etiqueta")
      return
    }
    setShowEmailModal(true)
  }

  const handleConfirmEmail = () => {
    toast.success("Email enviado com sucesso")
    setShowEmailModal(false)
  }

  const toggleTechnical = (id: number) => {
    setExpandedTechnical((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/compras" className="hover:text-imperial">
          Compras
        </Link>
        {" / "}
        <Link href="/compras/pos" className="hover:text-imperial">
          POs
        </Link>
        {" / "}
        <Link href={`/compras/pos/${poId}`} className="hover:text-imperial">
          PO #{poId}
        </Link>
        {" / "}
        <span className="text-foreground">Etiquetas Provisórias</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-imperial">Etiquetas Provisórias - PO #{poId}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/compras/pos/${poId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao PO
          </Button>
          <Button variant="outline" onClick={() => toast.success("Todas as etiquetas enviadas para impressão")}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Todas
          </Button>
          <Button className="bg-imperial hover:bg-imperial" onClick={() => toast.success("Download iniciado")}>
            <Download className="w-4 h-4 mr-2" />
            Baixar Todas (PDF)
          </Button>
        </div>
      </div>

      {/* Success Banner */}
      <div className="bg-twilight border border-twilight rounded-lg p-4 mb-6 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-imperial flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-imperial font-medium">
            {labels.length} etiquetas geradas com sucesso em {new Date().toLocaleString("pt-BR")}
          </p>
          <p className="text-sm text-imperial mt-1">
            Cole estas etiquetas nos documentos de acompanhamento da mercadoria
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">PO</div>
                  <div className="font-mono font-medium">#{poId}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Fornecedor</div>
                  <div className="font-medium">Fornecedor A</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total de Etiquetas</div>
                  <div className="font-medium text-imperial">{labels.length}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Gerado por</div>
                  <div className="font-medium">João Silva</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações em Lote</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selectAll"
                    checked={selectedLabels.length === labels.length}
                    onCheckedChange={toggleAll}
                  />
                  <Label htmlFor="selectAll" className="font-normal cursor-pointer">
                    Selecionar todas ({selectedLabels.length} de {labels.length})
                  </Label>
                </div>

                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintSelected}
                    disabled={selectedLabels.length === 0}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir Selecionadas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadSelected}
                    disabled={selectedLabels.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Selecionadas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-imperial border-imperial bg-transparent"
                    onClick={handleSendEmail}
                    disabled={selectedLabels.length === 0}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar por Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Labels List */}
          <div className="space-y-4">
            {labels.map((label) => (
              <Card key={label.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedLabels.includes(label.id)}
                      onCheckedChange={() => toggleLabel(label.id)}
                      className="mt-1"
                    />

                    {/* Label Preview */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                          <div className="text-center space-y-2">
                            <div className="text-xs font-bold text-imperial">STOCKSAFE - Etiqueta Provisória</div>
                            <div className="border-t border-b py-2 space-y-1">
                              <div className="text-xs">
                                <span className="font-medium">PO:</span> #{poId} |{" "}
                                <span className="font-medium">Linha:</span> {label.id}
                              </div>
                              <div className="text-xs">
                                <span className="font-medium">Produto:</span> {label.product}
                              </div>
                              <div className="text-xs">
                                <span className="font-medium">Fornecedor:</span> Fornecedor A
                              </div>
                            </div>
                            <div className="py-2 space-y-1">
                              <div className="text-xs">
                                <span className="font-medium">Lote Proposto:</span> {label.lot}
                              </div>
                              <div className="text-xs">
                                <span className="font-medium">Validade:</span>{" "}
                                {new Date(label.expiry).toLocaleDateString("pt-BR")}
                              </div>
                              <div className="text-xs">
                                <span className="font-medium">Quantidade:</span> {label.quantity}
                              </div>
                            </div>
                            <div className="bg-gray-800 h-12 flex items-center justify-center text-white text-xs font-mono">
                              |||||| |||| ||||||
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Data Emissão: {new Date().toLocaleDateString("pt-BR")}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Label Info */}
                      <div className="space-y-3">
                        <div>
                          <Badge className="bg-twilight text-imperial">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {label.status}
                          </Badge>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Código único</div>
                          <div className="font-mono text-sm">{label.code}</div>
                        </div>

                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-transparent"
                            onClick={() => toast.success("Enviado para impressão")}
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-transparent"
                            onClick={() => toast.success("Download iniciado")}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-transparent"
                            onClick={() => {
                              navigator.clipboard.writeText(label.code)
                              toast.success("Código copiado")
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar Código
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-orange-600 bg-transparent"
                            onClick={() => toast.success("Nova etiqueta gerada")}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reemitir
                          </Button>
                        </div>

                        {/* Technical Info */}
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between"
                            onClick={() => toggleTechnical(label.id)}
                          >
                            <span className="text-xs">Informações Técnicas</span>
                            {expandedTechnical.includes(label.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>

                          {expandedTechnical.includes(label.id) && (
                            <div className="mt-2 p-3 bg-gray-50 rounded text-xs space-y-2">
                              <div>
                                <div className="font-medium">Código de Barras:</div>
                                <div className="font-mono text-xs break-all">{label.barcode}</div>
                              </div>
                              <div>
                                <div className="font-medium">Formato:</div>
                                <div>GS1-128</div>
                              </div>
                              <div>
                                <div className="font-medium">Conteúdo decodificado:</div>
                                <div className="space-y-1 mt-1">
                                  <div>AI 01: GTIN do produto</div>
                                  <div>AI 10: {label.lot}</div>
                                  <div>AI 17: {label.expiry.replace(/-/g, "").slice(2)}</div>
                                  <div>
                                    Dados adicionais: PO_ID={poId}, Item_ID={label.id}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Print History */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Impressões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Data/Hora</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Usuário</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Etiquetas Impressas</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Impressora</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {printHistory.map((record, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm">{record.date}</td>
                        <td className="px-4 py-3 text-sm">{record.user}</td>
                        <td className="px-4 py-3 text-sm">{record.labels}</td>
                        <td className="px-4 py-3 text-sm">{record.printer}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge className="bg-twilight text-imperial">{record.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Print Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Impressão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="printer">Impressora Atual</Label>
                <Select defaultValue="zebra-zd420">
                  <SelectTrigger id="printer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zebra-zd420">Zebra ZD420 (Padrão)</SelectItem>
                    <SelectItem value="brother-ql">Brother QL-820NWB</SelectItem>
                    <SelectItem value="dymo-450">Dymo LabelWriter 450</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="copies">Cópias por Etiqueta</Label>
                <Input id="copies" type="number" min="1" defaultValue="2" />
              </div>

              <div>
                <Label htmlFor="paperSize">Tamanho do Papel</Label>
                <Select defaultValue="50x25">
                  <SelectTrigger id="paperSize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50x25">50×25mm</SelectItem>
                    <SelectItem value="100x50">100×50mm</SelectItem>
                    <SelectItem value="100x100">100×100mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="orientation">Orientação</Label>
                <Select defaultValue="landscape">
                  <SelectTrigger id="orientation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Paisagem</SelectItem>
                    <SelectItem value="portrait">Retrato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quality">Qualidade</Label>
                <Select defaultValue="normal">
                  <SelectTrigger id="quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => toast.success("Etiqueta de teste enviada")}
              >
                <Printer className="w-4 h-4 mr-2" />
                Testar Impressão
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instruções de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>1. Cole uma etiqueta no documento de acompanhamento da mercadoria</p>
                <p>2. Envie cópia ao fornecedor para que ele identifique o lote correspondente</p>
                <p>3. No recebimento, faça o scan da etiqueta para agilizar a conferência</p>
                <p>4. O código da etiqueta vincula o item previsto ao item real recebido</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enviar Etiquetas por Email</DialogTitle>
            <DialogDescription>
              {selectedLabels.length} etiqueta(s) selecionada(s) serão enviadas como anexo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="emailTo">Para</Label>
              <Input
                id="emailTo"
                type="email"
                placeholder="email@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="emailSubject">Assunto</Label>
              <Input id="emailSubject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="emailMessage">Mensagem</Label>
              <Textarea
                id="emailMessage"
                rows={8}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">Anexos: {selectedLabels.length} arquivo(s) PDF</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailModal(false)}>
              Cancelar
            </Button>
            <Button className="bg-imperial hover:bg-imperial" onClick={handleConfirmEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




