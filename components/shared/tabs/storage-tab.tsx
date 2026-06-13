"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { ProductFormData } from "@/components/features/registrations/product-form-content"
import { Thermometer, Droplets, Package } from "lucide-react"

interface StorageTabProps {
  formData: ProductFormData
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
}

export function StorageTab({ formData, updateFormData, errors }: StorageTabProps) {
  const updateStorageType = (field: string, value: any) => {
    updateFormData("storageType", {
      ...formData.storageType,
      [field]: value,
    })
  }

  const updateDimensions = (field: string, value: number) => {
    updateFormData("dimensions", {
      ...formData.dimensions,
      [field]: value,
    })
  }

  const toggleOtherCondition = (condition: string, checked: boolean) => {
    const newConditions = checked
      ? [...formData.storageType.otherConditions, condition]
      : formData.storageType.otherConditions.filter((c) => c !== condition)
    updateStorageType("otherConditions", newConditions)
  }

  const calculateVolume = () => {
    const { length, width, height } = formData.dimensions
    if (length && width && height) {
      return ((length * width * height) / 1000000).toFixed(3)
    }
    return "0.000"
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Storage Type - Temperature */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Tipo de Armazenamento - Temperatura
              <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.storageType.temperature}
              onValueChange={(value) => updateStorageType("temperature", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ambiente">Ambiente (15°C a 25°C)</SelectItem>
                <SelectItem value="refrigerado">Refrigerado (2°C a 8°C)</SelectItem>
                <SelectItem value="congelado">Congelado (-18°C ou menos)</SelectItem>
                <SelectItem value="customizado">Temperatura controlada customizada</SelectItem>
              </SelectContent>
            </Select>

            {formData.storageType.temperature === "customizado" && (
              <div className="flex gap-4 items-center ml-4">
                <div className="flex-1">
                  <Label htmlFor="tempMin" className="text-sm">
                    Mínima
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="tempMin"
                      type="number"
                      placeholder="Ex: 2"
                      value={formData.storageType.customTempMin || ""}
                      onChange={(e) => updateStorageType("customTempMin", Number(e.target.value))}
                    />
                    <span className="text-sm">°C</span>
                  </div>
                </div>
                <span className="mt-6">a</span>
                <div className="flex-1">
                  <Label htmlFor="tempMax" className="text-sm">
                    Máxima
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="tempMax"
                      type="number"
                      placeholder="Ex: 8"
                      value={formData.storageType.customTempMax || ""}
                      onChange={(e) => updateStorageType("customTempMax", Number(e.target.value))}
                    />
                    <span className="text-sm">°C</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Humidity */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Umidade
            </Label>
            <Select
              value={formData.storageType.humidity}
              onValueChange={(value) => updateStorageType("humidity", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ambiente">Ambiente (sem controle)</SelectItem>
                <SelectItem value="baixa">Baixa umidade (&lt; 40%)</SelectItem>
                <SelectItem value="media">Média umidade (40-60%)</SelectItem>
                <SelectItem value="alta">Alta umidade (&gt; 60%)</SelectItem>
                <SelectItem value="customizada">Customizada</SelectItem>
              </SelectContent>
            </Select>

            {formData.storageType.humidity === "customizada" && (
              <div className="ml-4">
                <div className="flex gap-2 items-center max-w-[200px]">
                  <Input
                    type="number"
                    placeholder="Ex: 50"
                    value={formData.storageType.customHumidity || ""}
                    onChange={(e) => updateStorageType("customHumidity", Number(e.target.value))}
                    min={0}
                    max={100}
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>
            )}
          </div>

          {/* Other Conditions */}
          <div className="space-y-3">
            <Label>Outras Condições:</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="protegido-luz"
                  checked={formData.storageType.otherConditions.includes("protegido-luz")}
                  onCheckedChange={(checked) => toggleOtherCondition("protegido-luz", checked as boolean)}
                />
                <Label htmlFor="protegido-luz" className="cursor-pointer font-normal">
                  Protegido da luz
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="protegido-contaminacao"
                  checked={formData.storageType.otherConditions.includes("protegido-contaminacao")}
                  onCheckedChange={(checked) => toggleOtherCondition("protegido-contaminacao", checked as boolean)}
                />
                <Label htmlFor="protegido-contaminacao" className="cursor-pointer font-normal">
                  Protegido de contaminação cruzada
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="area-segregada"
                  checked={formData.storageType.otherConditions.includes("area-segregada")}
                  onCheckedChange={(checked) => toggleOtherCondition("area-segregada", checked as boolean)}
                />
                <Label htmlFor="area-segregada" className="cursor-pointer font-normal">
                  Área segregada
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="vertical"
                  checked={formData.storageType.otherConditions.includes("vertical")}
                  onCheckedChange={(checked) => toggleOtherCondition("vertical", checked as boolean)}
                />
                <Label htmlFor="vertical" className="cursor-pointer font-normal">
                  Armazenagem vertical obrigatória
                </Label>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Define onde este produto pode ser armazenado</p>
          </div>

          {/* Max Stacking */}
          <div>
            <Label htmlFor="maxStacking">Empilhamento Máximo</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="maxStacking"
                type="number"
                placeholder="Ex: 5"
                value={formData.maxStacking || ""}
                onChange={(e) => updateFormData("maxStacking", Number(e.target.value))}
                min={0}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">unidades ou caixas</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Limite de segurança para empilhamento</p>
          </div>

          {/* Weight */}
          <div>
            <Label htmlFor="weightPerUnit">Peso por Unidade</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="weightPerUnit"
                type="number"
                step="0.01"
                placeholder="Ex: 2.5"
                value={formData.weightPerUnit || ""}
                onChange={(e) => updateFormData("weightPerUnit", Number(e.target.value))}
                min={0}
              />
              <Select value={formData.weightUnit} onValueChange={(value) => updateFormData("weightUnit", value)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="G">G</SelectItem>
                  <SelectItem value="TON">TON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Usado para cálculos de carga e transporte</p>
          </div>

          {/* Dimensions */}
          <div className="space-y-3">
            <Label>Dimensões</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="length" className="text-sm">
                  Comprimento
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="length"
                    type="number"
                    placeholder="0"
                    value={formData.dimensions.length || ""}
                    onChange={(e) => updateDimensions("length", Number(e.target.value))}
                    min={0}
                  />
                  <span className="text-sm">cm</span>
                </div>
              </div>
              <div>
                <Label htmlFor="width" className="text-sm">
                  Largura
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="width"
                    type="number"
                    placeholder="0"
                    value={formData.dimensions.width || ""}
                    onChange={(e) => updateDimensions("width", Number(e.target.value))}
                    min={0}
                  />
                  <span className="text-sm">cm</span>
                </div>
              </div>
              <div>
                <Label htmlFor="height" className="text-sm">
                  Altura
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="height"
                    type="number"
                    placeholder="0"
                    value={formData.dimensions.height || ""}
                    onChange={(e) => updateDimensions("height", Number(e.target.value))}
                    min={0}
                  />
                  <span className="text-sm">cm</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Dimensões da unidade de armazenagem (caixa/pallet)</p>
            {(formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) && (
              <p className="text-sm font-medium">Volume: {calculateVolume()} m³</p>
            )}
          </div>

          {/* Pallet Type */}
          <div>
            <Label htmlFor="palletType">Tipo de Pallet</Label>
            <Select value={formData.palletType} onValueChange={(value) => updateFormData("palletType", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não usa pallet</SelectItem>
                <SelectItem value="pbr">PBR (1,00x1,20m)</SelectItem>
                <SelectItem value="europeu">Europeu (0,80x1,20m)</SelectItem>
                <SelectItem value="customizado">Customizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Units per Pallet */}
          <div>
            <Label htmlFor="unitsPerPallet">Quantidade por Pallet</Label>
            <Input
              id="unitsPerPallet"
              type="number"
              placeholder="Ex: 100"
              value={formData.unitsPerPallet || ""}
              onChange={(e) => updateFormData("unitsPerPallet", Number(e.target.value))}
              min={0}
            />
            <p className="text-sm text-muted-foreground mt-1">Usado no planejamento de armazenagem</p>
          </div>

          {/* Special Instructions */}
          <div>
            <Label htmlFor="specialInstructions">Instruções Especiais</Label>
            <Textarea
              id="specialInstructions"
              placeholder="Ex: Mantenha longe de fontes de calor. Não expor à luz solar direta."
              value={formData.specialInstructions}
              onChange={(e) => updateFormData("specialInstructions", e.target.value)}
              rows={3}
            />
            <p className="text-sm text-muted-foreground mt-1">Orientações adicionais para a equipe de armazenagem</p>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="font-semibold mb-4">Preview de Armazenagem</h3>
            <div className="space-y-4">
              {/* Temperature Icon */}
              {formData.storageType.temperature !== "ambiente" && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Thermometer className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">
                      {formData.storageType.temperature === "refrigerado" && "Refrigerado"}
                      {formData.storageType.temperature === "congelado" && "Congelado"}
                      {formData.storageType.temperature === "customizado" && "Temp. Controlada"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formData.storageType.temperature === "refrigerado" && "2°C a 8°C"}
                      {formData.storageType.temperature === "congelado" && "-18°C ou menos"}
                      {formData.storageType.temperature === "customizado" &&
                        `${formData.storageType.customTempMin || "?"}°C a ${formData.storageType.customTempMax || "?"}°C`}
                    </p>
                  </div>
                </div>
              )}

              {/* Stacking Visualization */}
              {formData.maxStacking > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Empilhamento Máximo</p>
                  <div className="flex items-end gap-1 h-24">
                    {Array.from({ length: Math.min(formData.maxStacking, 5) }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-imperial rounded-t"
                        style={{ height: `${((i + 1) / Math.min(formData.maxStacking, 5)) * 100}%` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{formData.maxStacking} unidades</p>
                </div>
              )}

              {/* Dimensions */}
              {(formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Dimensões</p>
                  <div className="flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="text-xs text-center mt-2 space-y-1">
                    <p>
                      {formData.dimensions.length || 0} x {formData.dimensions.width || 0} x{" "}
                      {formData.dimensions.height || 0} cm
                    </p>
                    <p className="font-medium">Volume: {calculateVolume()} m³</p>
                  </div>
                </div>
              )}

              {/* Conditions Summary */}
              {formData.storageType.otherConditions.length > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Condições Especiais</p>
                  <ul className="text-xs space-y-1">
                    {formData.storageType.otherConditions.map((condition) => (
                      <li key={condition} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full" />
                        {condition === "protegido-luz" && "Protegido da luz"}
                        {condition === "protegido-contaminacao" && "Sem contaminação cruzada"}
                        {condition === "area-segregada" && "Área segregada"}
                        {condition === "vertical" && "Armazenagem vertical"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}





