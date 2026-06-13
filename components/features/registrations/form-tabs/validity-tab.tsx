"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductFormData } from "@/components/features/registrations/product-form-content"

interface ValidityTabProps {
  formData: ProductFormData
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
}

export function ValidityTab({ formData, updateFormData, errors }: ValidityTabProps) {
  const alertOptions = [
    { days: 7, label: "7 dias" },
    { days: 15, label: "15 dias" },
    { days: 30, label: "30 dias" },
    { days: 60, label: "60 dias" },
    { days: 90, label: "90 dias" },
  ]

  const handleAlertDayChange = (days: number, checked: boolean) => {
    const updated = checked
      ? [...formData.alertDays, days]
      : formData.alertDays.filter((d) => d !== days)
    updateFormData("alertDays", updated.sort((a, b) => a - b))
  }

  return (
    <div className="space-y-6">
      {/* Shelf Life */}
      <Card>
        <CardHeader>
          <CardTitle>Vida Útil</CardTitle>
          <CardDescription>Configurações de validade do produto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shelfLife">Vida Útil (dias)</Label>
              <Input
                id="shelfLife"
                type="number"
                min="0"
                value={formData.shelfLife}
                onChange={(e) => updateFormData("shelfLife", parseInt(e.target.value) || 0)}
                className={errors.shelfLife ? "border-red-500" : ""}
              />
              {errors.shelfLife && <p className="text-sm text-red-500">{errors.shelfLife}</p>}
              <p className="text-sm text-muted-foreground">
                Dias de validade total do produto desde a fabricação
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expeditionPolicy">Política de Expedição</Label>
              <Select
                value={formData.expeditionPolicy}
                onValueChange={(value: any) => updateFormData("expeditionPolicy", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FEFO">FEFO - First Expired, First Out</SelectItem>
                  <SelectItem value="FIFO">FIFO - First In, First Out</SelectItem>
                  <SelectItem value="LIFO">LIFO - Last In, First Out</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Critério para seleção de lotes na expedição
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Minimum Validity */}
      <Card>
        <CardHeader>
          <CardTitle>Validade Mínima</CardTitle>
          <CardDescription>Validade mínima para recebimento de mercadorias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Controle</Label>
            <RadioGroup
              value={formData.minValidityType}
              onValueChange={(value: any) => updateFormData("minValidityType", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage">Porcentagem da vida útil</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="days" id="days" />
                <Label htmlFor="days">Dias específicos</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minValidityValue">
                {formData.minValidityType === "percentage" ? "Porcentagem Mínima (%)" : "Dias Mínimos"}
              </Label>
              <Input
                id="minValidityValue"
                type="number"
                min="0"
                max={formData.minValidityType === "percentage" ? "100" : undefined}
                value={formData.minValidityValue}
                onChange={(e) => updateFormData("minValidityValue", parseInt(e.target.value) || 0)}
                className={errors.minValidityValue ? "border-red-500" : ""}
              />
              {errors.minValidityValue && <p className="text-sm text-red-500">{errors.minValidityValue}</p>}
              <p className="text-sm text-muted-foreground">
                {formData.minValidityType === "percentage"
                  ? "% mínima de vida útil para recebimento"
                  : "Dias mínimos de validade para recebimento"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minValidityForClient">Validade Mínima para Cliente (dias)</Label>
              <Input
                id="minValidityForClient"
                type="number"
                min="0"
                value={formData.minValidityForClient}
                onChange={(e) => updateFormData("minValidityForClient", parseInt(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground">
                Dias mínimos de validade para envio ao cliente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validity Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Validade</CardTitle>
          <CardDescription>Configuração de notificações sobre vencimento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableAlerts">Habilitar Alertas</Label>
              <p className="text-sm text-muted-foreground">Receber notificações de produtos próximos ao vencimento</p>
            </div>
            <Switch
              id="enableAlerts"
              checked={formData.enableAlerts}
              onCheckedChange={(checked) => updateFormData("enableAlerts", checked)}
            />
          </div>

          {formData.enableAlerts && (
            <>
              <div className="space-y-2">
                <Label>Alertar quando faltarem</Label>
                <div className="grid grid-cols-3 gap-4">
                  {alertOptions.map((option) => (
                    <div key={option.days} className="flex items-center space-x-2">
                      <Checkbox
                        id={`alert-${option.days}`}
                        checked={formData.alertDays.includes(option.days)}
                        onCheckedChange={(checked) => handleAlertDayChange(option.days, checked as boolean)}
                      />
                      <Label htmlFor={`alert-${option.days}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customAlertDays">Alerta Personalizado (dias)</Label>
                <Input
                  id="customAlertDays"
                  type="number"
                  min="0"
                  value={formData.customAlertDays}
                  onChange={(e) => updateFormData("customAlertDays", parseInt(e.target.value) || 0)}
                  placeholder="Digite um número de dias"
                />
                <p className="text-sm text-muted-foreground">
                  Adicione um período customizado para alertas
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




