"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductFormData } from "@/components/features/registrations/product-form-content"

interface StorageTabProps {
  formData: ProductFormData
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
}

export function StorageTab({ formData, updateFormData, errors }: StorageTabProps) {
  const conditionOptions = [
    "Proteger da Luz",
    "Manter Seco",
    "Não Empilhar",
    "Frágil",
    "Inflamável",
    "Manter na Vertical",
  ]

  const handleStorageTypeChange = (field: string, value: any) => {
    updateFormData("storageType", {
      ...formData.storageType,
      [field]: value,
    })
  }

  const handleDimensionChange = (field: string, value: number) => {
    updateFormData("dimensions", {
      ...formData.dimensions,
      [field]: value,
    })
  }

  const handleConditionChange = (condition: string, checked: boolean) => {
    const updated = checked
      ? [...formData.storageType.otherConditions, condition]
      : formData.storageType.otherConditions.filter((c) => c !== condition)
    handleStorageTypeChange("otherConditions", updated)
  }

  return (
    <div className="space-y-6">
      {/* Storage Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Condições de Armazenagem</CardTitle>
          <CardDescription>Requisitos ambientais para armazenamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperatura</Label>
            <Select
              value={formData.storageType.temperature}
              onValueChange={(value) => handleStorageTypeChange("temperature", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ambiente">Ambiente (15°C a 25°C)</SelectItem>
                <SelectItem value="refrigerado">Refrigerado (2°C a 8°C)</SelectItem>
                <SelectItem value="congelado">Congelado (-18°C ou menos)</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.storageType.temperature === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customTempMin">Temperatura Mínima (°C)</Label>
                <Input
                  id="customTempMin"
                  type="number"
                  value={formData.storageType.customTempMin || ""}
                  onChange={(e) => handleStorageTypeChange("customTempMin", parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customTempMax">Temperatura Máxima (°C)</Label>
                <Input
                  id="customTempMax"
                  type="number"
                  value={formData.storageType.customTempMax || ""}
                  onChange={(e) => handleStorageTypeChange("customTempMax", parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="humidity">Umidade</Label>
            <Select
              value={formData.storageType.humidity}
              onValueChange={(value) => handleStorageTypeChange("humidity", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ambiente">Ambiente (30% a 70%)</SelectItem>
                <SelectItem value="baixa">Baixa (menos de 30%)</SelectItem>
                <SelectItem value="alta">Alta (mais de 70%)</SelectItem>
                <SelectItem value="custom">Personalizada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.storageType.humidity === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="customHumidity">Umidade Máxima (%)</Label>
              <Input
                id="customHumidity"
                type="number"
                min="0"
                max="100"
                value={formData.storageType.customHumidity || ""}
                onChange={(e) => handleStorageTypeChange("customHumidity", parseFloat(e.target.value))}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Outras Condições</Label>
            <div className="grid grid-cols-3 gap-4">
              {conditionOptions.map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${condition}`}
                    checked={formData.storageType.otherConditions.includes(condition)}
                    onCheckedChange={(checked) => handleConditionChange(condition, checked as boolean)}
                  />
                  <Label htmlFor={`condition-${condition}`}>{condition}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical Characteristics */}
      <Card>
        <CardHeader>
          <CardTitle>Características Físicas</CardTitle>
          <CardDescription>Dimensões e peso do produto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weightPerUnit">Peso por Unidade</Label>
              <Input
                id="weightPerUnit"
                type="number"
                min="0"
                step="0.01"
                value={formData.weightPerUnit}
                onChange={(e) => updateFormData("weightPerUnit", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightUnit">Unidade de Peso</Label>
              <Select value={formData.weightUnit} onValueChange={(value) => updateFormData("weightUnit", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">Quilograma (KG)</SelectItem>
                  <SelectItem value="G">Grama (G)</SelectItem>
                  <SelectItem value="TON">Tonelada (TON)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Comprimento (cm)</Label>
              <Input
                id="length"
                type="number"
                min="0"
                step="0.1"
                value={formData.dimensions.length}
                onChange={(e) => handleDimensionChange("length", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Largura (cm)</Label>
              <Input
                id="width"
                type="number"
                min="0"
                step="0.1"
                value={formData.dimensions.width}
                onChange={(e) => handleDimensionChange("width", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                min="0"
                step="0.1"
                value={formData.dimensions.height}
                onChange={(e) => handleDimensionChange("height", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStacking">Empilhamento Máximo</Label>
            <Input
              id="maxStacking"
              type="number"
              min="0"
              value={formData.maxStacking}
              onChange={(e) => updateFormData("maxStacking", parseInt(e.target.value) || 0)}
            />
            <p className="text-sm text-muted-foreground">
              Número máximo de unidades que podem ser empilhadas (0 = sem limite)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pallet Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Palete</CardTitle>
          <CardDescription>Informações sobre paletização</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="palletType">Tipo de Palete</Label>
              <Select value={formData.palletType} onValueChange={(value) => updateFormData("palletType", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem Palete</SelectItem>
                  <SelectItem value="PBR">PBR (1,00 x 1,20m)</SelectItem>
                  <SelectItem value="euro">Euro Palete (0,80 x 1,20m)</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.palletType !== "none" && (
              <div className="space-y-2">
                <Label htmlFor="unitsPerPallet">Unidades por Palete</Label>
                <Input
                  id="unitsPerPallet"
                  type="number"
                  min="0"
                  value={formData.unitsPerPallet}
                  onChange={(e) => updateFormData("unitsPerPallet", parseInt(e.target.value) || 0)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções Especiais</CardTitle>
          <CardDescription>Observações e incompatibilidades</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Instruções de Armazenagem</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => updateFormData("specialInstructions", e.target.value)}
              rows={4}
              placeholder="Adicione instruções especiais para armazenagem deste produto..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




