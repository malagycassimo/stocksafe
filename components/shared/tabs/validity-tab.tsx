"use client"

import { Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { ProductFormData } from "@/components/features/registrations/product-form-content"

interface ValidityTabProps {
  formData: ProductFormData
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
}

export function ValidityTab({ formData, updateFormData, errors }: ValidityTabProps) {
  const handleAlertDayToggle = (day: number, checked: boolean) => {
    const newAlertDays = checked
      ? [...formData.alertDays, day].sort((a, b) => a - b)
      : formData.alertDays.filter((d) => d !== day)
    updateFormData("alertDays", newAlertDays)
  }

  const calculateMinDays = () => {
    if (formData.shelfLife && formData.minValidityType === "percentage") {
      return Math.ceil((formData.shelfLife * formData.minValidityValue) / 100)
    }
    return formData.minValidityValue
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
        <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800">
          Estas configurações controlam as regras de aceitação e alerta de validade para este produto em todo o sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Shelf Life */}
          <div>
            <Label htmlFor="shelfLife" className="flex items-center gap-2">
              Vida Útil Total
              {formData.lotControl && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="shelfLife"
                type="number"
                placeholder="Ex: 30"
                value={formData.shelfLife || ""}
                onChange={(e) => updateFormData("shelfLife", Number(e.target.value))}
                className={errors.shelfLife ? "border-red-500" : ""}
                min={1}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">dias</span>
            </div>
            {errors.shelfLife && <p className="text-sm text-red-500 mt-1">{errors.shelfLife}</p>}
            <p className="text-sm text-muted-foreground mt-1">Período total desde a fabricação até o vencimento</p>
          </div>

          {/* Minimum Entry Validity */}
          <div className="space-y-4">
            <Label>Validade Mínima na Entrada</Label>
            <RadioGroup
              value={formData.minValidityType}
              onValueChange={(value: "percentage" | "days") => updateFormData("minValidityType", value)}
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="percentage" id="percentage" className="mt-1" />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="percentage" className="cursor-pointer font-normal">
                      Por percentual da vida útil
                    </Label>
                    {formData.minValidityType === "percentage" && (
                      <>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            placeholder="70"
                            value={formData.minValidityValue || ""}
                            onChange={(e) => updateFormData("minValidityValue", Number(e.target.value))}
                            min={0}
                            max={100}
                            className="max-w-[120px]"
                          />
                          <span className="text-sm text-muted-foreground">% da vida útil</span>
                        </div>
                        {formData.shelfLife > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Exemplo: Se vida útil = {formData.shelfLife} dias e mínimo = {formData.minValidityValue}%,
                            então aceita produtos com ≥ {calculateMinDays()} dias restantes
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <RadioGroupItem value="days" id="days" className="mt-1" />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="days" className="cursor-pointer font-normal">
                      Por dias absolutos
                    </Label>
                    {formData.minValidityType === "days" && (
                      <>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            placeholder="21"
                            value={formData.minValidityValue || ""}
                            onChange={(e) => updateFormData("minValidityValue", Number(e.target.value))}
                            min={1}
                            className="max-w-[120px]"
                          />
                          <span className="text-sm text-muted-foreground">dias</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Aceita produtos com no mínimo {formData.minValidityValue} dias até vencer
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              Produtos com validade inferior ao mínimo irão para quarentena no recebimento
            </p>
          </div>

          {/* Expedition Policy */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              Política de Expedição
              <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.expeditionPolicy}
              onValueChange={(value: "FEFO" | "FIFO" | "LIFO") => updateFormData("expeditionPolicy", value)}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <RadioGroupItem value="FEFO" id="fefo" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="fefo" className="cursor-pointer font-medium">
                        FEFO (First-Expire-First-Out)
                      </Label>
                      <Badge className="bg-imperial">RECOMENDADO</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Produtos com validade mais próxima saem primeiro
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <RadioGroupItem value="FIFO" id="fifo" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="fifo" className="cursor-pointer font-medium">
                      FIFO (First-In-First-Out)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">Produtos que entraram primeiro saem primeiro</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <RadioGroupItem value="LIFO" id="lifo" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="lifo" className="cursor-pointer font-medium">
                        LIFO (Last-In-First-Out)
                      </Label>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                        ⚠️ Não recomendado para perecíveis
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Produtos que entraram por último saem primeiro</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Validity Alerts */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="enableAlerts"
                checked={formData.enableAlerts}
                onCheckedChange={(checked) => updateFormData("enableAlerts", checked)}
              />
              <Label htmlFor="enableAlerts" className="cursor-pointer">
                Ativar alertas automáticos
              </Label>
            </div>

            {formData.enableAlerts && (
              <div className="ml-7 space-y-3">
                <Label>Alertar quando faltar:</Label>
                <div className="space-y-2">
                  {[7, 15, 30, 60, 90].map((days) => (
                    <div key={days} className="flex items-center gap-3">
                      <Checkbox
                        id={`alert-${days}`}
                        checked={formData.alertDays.includes(days)}
                        onCheckedChange={(checked) => handleAlertDayToggle(days, checked as boolean)}
                      />
                      <Label htmlFor={`alert-${days}`} className="cursor-pointer font-normal">
                        {days} dias
                      </Label>
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Outro:</span>
                    <Input
                      type="number"
                      placeholder="dias"
                      value={formData.customAlertDays || ""}
                      onChange={(e) => updateFormData("customAlertDays", Number(e.target.value))}
                      className="max-w-[100px]"
                      min={1}
                    />
                    <span className="text-sm text-muted-foreground">dias</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sistema enviará notificações quando itens atingirem estes prazos
                </p>
              </div>
            )}
          </div>

          {/* Client Validity */}
          <div>
            <Label htmlFor="minValidityForClient">Validade para Cliente Final</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="minValidityForClient"
                type="number"
                placeholder="Ex: 15"
                value={formData.minValidityForClient || ""}
                onChange={(e) => updateFormData("minValidityForClient", Number(e.target.value))}
                min={0}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">dias</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Bloqueia expedição de itens com validade inferior a este valor
            </p>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="font-semibold mb-4">Linha do Tempo de Validade</h3>
            <div className="space-y-4">
              {/* Timeline visualization */}
              <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="bg-imperial flex-1" style={{ flexBasis: "60%" }} />
                  <div className="bg-yellow-400 flex-1" style={{ flexBasis: "25%" }} />
                  <div className="bg-red-500 flex-1" style={{ flexBasis: "15%" }} />
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-imperial rounded" />
                  <span>Zona de Aceitação (≥ {calculateMinDays()} dias)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded" />
                  <span>Zona de Alerta</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded" />
                  <span>Rejeitado/Vencido</span>
                </div>
              </div>

              {/* Alert markers */}
              {formData.enableAlerts && formData.alertDays.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Alertas configurados:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.alertDays.map((days) => (
                      <Badge key={days} variant="outline">
                        {days}d
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}





