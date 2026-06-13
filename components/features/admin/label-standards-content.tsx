"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer, Save } from "lucide-react"

export function LabelStandardsContent() {
  const [codeType, setCodeType] = useState("barcode")
  const [labelSize, setLabelSize] = useState("50x25")
  const [orientation, setOrientation] = useState("landscape")
  const [barWidth, setBarWidth] = useState([40])
  const [barHeight, setBarHeight] = useState([15])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-imperial">Padrões de Códigos e Etiquetas</h1>
        <p className="text-muted-foreground">Configuração de layouts e formatos de etiquetas</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="provisional" className="w-full">
        <TabsList>
          <TabsTrigger value="provisional">Etiquetas Provisórias</TabsTrigger>
          <TabsTrigger value="real-batch">Etiquetas de Lote Real</TabsTrigger>
          <TabsTrigger value="location">Etiquetas de Localização</TabsTrigger>
          <TabsTrigger value="barcodes">Códigos de Barras</TabsTrigger>
        </TabsList>

        <TabsContent value="provisional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração Geral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Código *</Label>
                <RadioGroup value={codeType} onValueChange={setCodeType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="barcode" id="barcode" />
                    <Label htmlFor="barcode" className="font-normal">
                      Código de Barras (1D - Code 128)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="qrcode" id="qrcode" />
                    <Label htmlFor="qrcode" className="font-normal">
                      QR Code (2D)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both" className="font-normal">
                      Ambos (um de cada)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="label-size">Tamanho da Etiqueta *</Label>
                  <Select value={labelSize} onValueChange={setLabelSize}>
                    <SelectTrigger id="label-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50x25">50×25 mm (padrão "papelinho")</SelectItem>
                      <SelectItem value="75x30">75×30 mm</SelectItem>
                      <SelectItem value="100x50">100×50 mm</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Orientação</Label>
                  <RadioGroup value={orientation} onValueChange={setOrientation}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="landscape" id="landscape" />
                      <Label htmlFor="landscape" className="font-normal">Paisagem (horizontal)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="portrait" id="portrait" />
                      <Label htmlFor="portrait" className="font-normal">Retrato (vertical)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="printer">Impressora Padrão</Label>
                  <Select>
                    <SelectTrigger id="printer">
                      <SelectValue placeholder="Selecione a impressora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zebra1">Zebra ZD420</SelectItem>
                      <SelectItem value="zebra2">Zebra ZT230</SelectItem>
                      <SelectItem value="brother">Brother QL-800</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copies">Quantidade de Cópias Padrão</Label>
                  <Input id="copies" type="number" defaultValue="2" />
                  <p className="text-xs text-muted-foreground">Número de etiquetas por item</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conteúdo da Etiqueta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="logo" defaultChecked disabled />
                <Label htmlFor="logo" className="font-normal">Logo StockSafe (obrigatório)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="title" defaultChecked disabled />
                <Label htmlFor="title" className="font-normal">Título "Etiqueta Provisória"</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="po-number" defaultChecked />
                <Label htmlFor="po-number" className="font-normal">Número do PO</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="line-number" defaultChecked />
                <Label htmlFor="line-number" className="font-normal">Número da Linha</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="sku" defaultChecked />
                <Label htmlFor="sku" className="font-normal">SKU do Produto</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="description" defaultChecked />
                <Label htmlFor="description" className="font-normal">Descrição do Produto</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="supplier" defaultChecked />
                <Label htmlFor="supplier" className="font-normal">Fornecedor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="batch-proposed" defaultChecked />
                <Label htmlFor="batch-proposed" className="font-normal">Lote Proposto (destaque)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="validity-proposed" defaultChecked />
                <Label htmlFor="validity-proposed" className="font-normal">Validade Proposta (destaque)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="quantity" defaultChecked />
                <Label htmlFor="quantity" className="font-normal">Quantidade Prevista</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="unit" defaultChecked />
                <Label htmlFor="unit" className="font-normal">Unidade de Medida</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="issue-date" defaultChecked />
                <Label htmlFor="issue-date" className="font-normal">Data de Emissão</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="code" defaultChecked disabled />
                <Label htmlFor="code" className="font-normal">Código de Barras/QR (obrigatório)</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formato do Código</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted rounded text-sm font-mono">
                <p className="font-medium mb-2">Especificações GS1-128:</p>
                <p>AI (01): GTIN/SKU</p>
                <p>AI (10): Lote Proposto</p>
                <p>AI (17): Validade Proposta (formato AAMMDD)</p>
                <p className="mt-2">Dados Adicionais:</p>
                <p>PO_ID: [numérico]</p>
                <p>Item_ID: [numérico]</p>
              </div>
              <div className="p-3 bg-twilight rounded">
                <p className="text-sm font-medium mb-1">Exemplo de código gerado:</p>
                <p className="text-xs font-mono break-all">(01)07891234567890(10)L2025001(17)251231PO12345LN001</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 bg-muted/50">
                <div className="w-64 h-32 mx-auto bg-white border-2 border-gray-300 rounded p-2 text-xs">
                  <div className="text-center font-bold text-[8px]">STOCKSAFE</div>
                  <div className="text-center text-[7px] mb-1">Etiqueta Provisória</div>
                  <div className="text-[6px] space-y-0.5">
                    <p><span className="font-medium">PO:</span> PO-2025-0001</p>
                    <p><span className="font-medium">SKU:</span> FRS-045</p>
                    <p><span className="font-medium">Produto:</span> Filé de Frango</p>
                    <p className="font-bold text-imperial"><span className="font-medium">Lote:</span> L2025001</p>
                    <p className="font-bold text-imperial"><span className="font-medium">Val:</span> 31/12/2025</p>
                  </div>
                  <div className="mt-1 h-6 bg-gray-800 flex items-center justify-center">
                    <div className="text-white text-[4px]">|||| |||| ||||</div>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <Button variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Teste
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="bg-imperial hover:bg-imperial">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="real-batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração Geral</CardTitle>
              <CardDescription>Etiquetas de lote real (permanentes)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Estrutura similar às etiquetas provisórias, mas com dados confirmados do lote real
              </p>

              <div className="space-y-2">
                <Label>Conteúdo:</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="real-product" defaultChecked disabled />
                    <Label htmlFor="real-product" className="font-normal">Produto (SKU + Descrição)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="real-batch" defaultChecked disabled />
                    <Label htmlFor="real-batch" className="font-normal">Lote Real</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="real-validity" defaultChecked disabled />
                    <Label htmlFor="real-validity" className="font-normal">Validade Real</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="real-quantity" defaultChecked />
                    <Label htmlFor="real-quantity" className="font-normal">Quantidade</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="real-location" defaultChecked />
                    <Label htmlFor="real-location" className="font-normal">Local de Armazenagem</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="real-receive-date" defaultChecked />
                    <Label htmlFor="real-receive-date" className="font-normal">Data de Recebimento</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="real-supplier" defaultChecked />
                    <Label htmlFor="real-supplier" className="font-normal">Fornecedor</Label>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm font-medium text-blue-900">Material sugerido: Adesivo resistente</p>
                <p className="text-xs text-blue-700 mt-1">Tamanhos maiores disponíveis para etiqueta permanente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Etiquetas de Localização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Formato do Código de Localização</Label>
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm font-medium mb-2">Padrão: [ARM][ZN][COR][PRAT][POS]</p>
                  <p className="text-xs text-muted-foreground mb-2">Exemplo: A01-ZF-CA-P01-001</p>
                  <div className="flex gap-2">
                    <Input placeholder="Separador" defaultValue="-" className="w-24" />
                    <span className="text-sm text-muted-foreground flex items-center">
                      Permite customizar separadores
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo de Código</Label>
                  <RadioGroup defaultValue="barcode">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="barcode" id="loc-barcode" />
                      <Label htmlFor="loc-barcode" className="font-normal">Código de Barras</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="qrcode" id="loc-qrcode" />
                      <Label htmlFor="loc-qrcode" className="font-normal">QR Code</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Tamanho</Label>
                  <Select defaultValue="100x50">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100x50">100×50 mm</SelectItem>
                      <SelectItem value="150x75">150×75 mm</SelectItem>
                      <SelectItem value="200x100">200×100 mm (grande)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Conteúdo:</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="loc-code" defaultChecked disabled />
                    <Label htmlFor="loc-code" className="font-normal">Código completo (legível)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="loc-hierarchy" defaultChecked />
                    <Label htmlFor="loc-hierarchy" className="font-normal">Hierarquia (Armazém &gt; Zona &gt; Corredor &gt; Prateleira)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="loc-conditions" defaultChecked />
                    <Label htmlFor="loc-conditions" className="font-normal">Condições (Temperatura, Umidade)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="loc-capacity" defaultChecked />
                    <Label htmlFor="loc-capacity" className="font-normal">Capacidade Máxima</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="loc-barcode-large" defaultChecked disabled />
                    <Label htmlFor="loc-barcode-large" className="font-normal">Código de Barras/QR (grande)</Label>
                  </div>
                </div>
              </div>

              <Card className="border-twilight bg-twilight">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-imperial mb-2">Impressão em Lote</p>
                  <p className="text-xs text-imperial mb-3">
                    Permite gerar etiquetas para múltiplos locais
                  </p>
                  <Button className="bg-imperial hover:bg-imperial">
                    Gerar Etiquetas em Lote
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="barcodes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Padrões Globais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="barcode-standard">Padrão de Códigos de Barras 1D *</Label>
                  <Select defaultValue="code128">
                    <SelectTrigger id="barcode-standard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="code128">Code 128 (recomendado)</SelectItem>
                      <SelectItem value="code39">Code 39</SelectItem>
                      <SelectItem value="ean13">EAN-13</SelectItem>
                      <SelectItem value="upca">UPC-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qr-standard">Padrão de QR Code</Label>
                  <Select defaultValue="qr">
                    <SelectTrigger id="qr-standard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qr">QR Code Padrão</SelectItem>
                      <SelectItem value="datamatrix">Data Matrix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Largura do Código de Barras: {barWidth[0]} mm</Label>
                  <Slider
                    value={barWidth}
                    onValueChange={setBarWidth}
                    min={20}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Altura do Código de Barras: {barHeight[0]} mm</Label>
                  <Slider
                    value={barHeight}
                    onValueChange={setBarHeight}
                    min={5}
                    max={30}
                    step={1}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="show-readable" defaultChecked />
                  <Label htmlFor="show-readable" className="font-normal">Mostrar número legível abaixo do código</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prefix">Prefixo de Identificação</Label>
                <Input
                  id="prefix"
                  placeholder="Ex: SS (StockSafe)"
                  defaultValue="SS"
                />
                <p className="text-xs text-muted-foreground">
                  Código da empresa/sistema usado em códigos gerados
                </p>
              </div>

              <div className="space-y-2">
                <Label>Nível de Correção de Erro QR Code</Label>
                <RadioGroup defaultValue="M">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="L" id="error-L" />
                    <Label htmlFor="error-L" className="font-normal">L - Baixo (7%)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="M" id="error-M" />
                    <Label htmlFor="error-M" className="font-normal">M - Médio (15%)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Q" id="error-Q" />
                    <Label htmlFor="error-Q" className="font-normal">Q - Alto (25%)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="H" id="error-H" />
                    <Label htmlFor="error-H" className="font-normal">H - Muito Alto (30%)</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="validate-gs1" defaultChecked />
                <Label htmlFor="validate-gs1" className="font-normal">Validar formato GS1-128</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="check-digit" defaultChecked />
                <Label htmlFor="check-digit" className="font-normal">Verificar dígito verificador</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="allow-custom" />
                <Label htmlFor="allow-custom" className="font-normal">Permitir códigos customizados</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integração com Leitores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Leitores/Scanners Cadastrados</Label>
                <div className="border rounded p-3 bg-muted/50">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Scanner Zebra DS3678</p>
                        <p className="text-xs text-muted-foreground">Porta: COM3</p>
                      </div>
                      <Badge variant="outline" className="bg-twilight text-imperial">Conectado</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="outline">Testar Leitura</Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="bg-imperial hover:bg-imperial">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}




