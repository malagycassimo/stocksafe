"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductFormData } from "@/components/features/registrations/product-form-content"

interface TraceabilityTabProps {
  formData: ProductFormData
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
}

export function TraceabilityTab({ formData, updateFormData, errors }: TraceabilityTabProps) {
  const lotRequiredOptions = [
    { value: "recebimento", label: "Recebimento" },
    { value: "armazenagem", label: "Armazenagem" },
    { value: "expedicao", label: "Expedição" },
    { value: "inventario", label: "Inventário" },
  ]

  const certificationOptions = [
    "ISO 9001",
    "ISO 22000",
    "HACCP",
    "Orgânico",
    "Kosher",
    "Halal",
    "Outros",
  ]

  const handleLotRequiredChange = (option: string, checked: boolean) => {
    const updated = checked
      ? [...formData.lotRequiredIn, option]
      : formData.lotRequiredIn.filter((o) => o !== option)
    updateFormData("lotRequiredIn", updated)
  }

  const handleCertificationChange = (cert: string, checked: boolean) => {
    const updated = checked
      ? [...formData.certifications, cert]
      : formData.certifications.filter((c) => c !== cert)
    updateFormData("certifications", updated)
  }

  return (
    <div className="space-y-6">
      {/* Lot Control */}
      <Card>
        <CardHeader>
          <CardTitle>Controle de Lote</CardTitle>
          <CardDescription>Configurações de rastreabilidade por lote</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="lotControl">Controle por Lote</Label>
              <p className="text-sm text-muted-foreground">Habilitar rastreamento por número de lote</p>
            </div>
            <Switch
              id="lotControl"
              checked={formData.lotControl}
              onCheckedChange={(checked) => updateFormData("lotControl", checked)}
            />
          </div>

          {formData.lotControl && (
            <>
              <div className="space-y-2">
                <Label>Formato do Lote</Label>
                <RadioGroup
                  value={formData.lotFormat}
                  onValueChange={(value: any) => updateFormData("lotFormat", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="free" />
                    <Label htmlFor="free">Formato Livre</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="specific" id="specific" />
                    <Label htmlFor="specific">Formato Específico (máscara)</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.lotFormat === "specific" && (
                <div className="space-y-2">
                  <Label htmlFor="lotMask">Máscara do Lote</Label>
                  <Input
                    id="lotMask"
                    value={formData.lotMask}
                    onChange={(e) => updateFormData("lotMask", e.target.value)}
                    placeholder="Ex: LLNN-AAAA (L=Letra, N=Número, A=Alfanumérico)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Use L para letra, N para número, A para alfanumérico
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Lote Obrigatório em</Label>
                <div className="grid grid-cols-2 gap-4">
                  {lotRequiredOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lot-${option.value}`}
                        checked={formData.lotRequiredIn.includes(option.value)}
                        onCheckedChange={(checked) => handleLotRequiredChange(option.value, checked as boolean)}
                      />
                      <Label htmlFor={`lot-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Serial Number Control */}
      <Card>
        <CardHeader>
          <CardTitle>Controle por Número de Série</CardTitle>
          <CardDescription>Rastreamento individual de unidades</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="trackBySerial">Rastrear por Número de Série</Label>
              <p className="text-sm text-muted-foreground">Controle individual de cada unidade do produto</p>
            </div>
            <Switch
              id="trackBySerial"
              checked={formData.trackBySerial}
              onCheckedChange={(checked) => updateFormData("trackBySerial", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documentation Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Requisitos de Documentação</CardTitle>
          <CardDescription>Documentos obrigatórios para o produto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="requireDatasheet">Ficha Técnica Obrigatória</Label>
              <p className="text-sm text-muted-foreground">Exigir ficha técnica no cadastro e recebimento</p>
            </div>
            <Switch
              id="requireDatasheet"
              checked={formData.requireDatasheet}
              onCheckedChange={(checked) => updateFormData("requireDatasheet", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="requireCertifications">Certificações Obrigatórias</Label>
              <p className="text-sm text-muted-foreground">Exigir certificações específicas</p>
            </div>
            <Switch
              id="requireCertifications"
              checked={formData.requireCertifications}
              onCheckedChange={(checked) => updateFormData("requireCertifications", checked)}
            />
          </div>

          {formData.requireCertifications && (
            <div className="space-y-2">
              <Label>Certificações Necessárias</Label>
              <div className="grid grid-cols-3 gap-4">
                {certificationOptions.map((cert) => (
                  <div key={cert} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cert-${cert}`}
                      checked={formData.certifications.includes(cert)}
                      onCheckedChange={(checked) => handleCertificationChange(cert, checked as boolean)}
                    />
                    <Label htmlFor={`cert-${cert}`}>{cert}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quarantine */}
      <Card>
        <CardHeader>
          <CardTitle>Quarentena</CardTitle>
          <CardDescription>Período de quarentena após recebimento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quarantineDays">Dias de Quarentena</Label>
            <Input
              id="quarantineDays"
              type="number"
              min="0"
              value={formData.quarantineDays}
              onChange={(e) => updateFormData("quarantineDays", parseInt(e.target.value) || 0)}
            />
            <p className="text-sm text-muted-foreground">
              Número de dias em que o produto deve permanecer em quarentena após o recebimento (0 = sem quarentena)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




