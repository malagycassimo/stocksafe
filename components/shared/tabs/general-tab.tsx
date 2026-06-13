"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import type { ProductFormData } from "@/components/features/registrations/product-form-content"

interface GeneralTabProps {
  formData: ProductFormData
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
}

export function GeneralTab({ formData, updateFormData, errors }: GeneralTabProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-2 gap-6">
        {/* SKU */}
        <div className="col-span-2 md:col-span-1">
          <Label htmlFor="sku" className="flex items-center gap-2">
            Código do Produto (SKU/GTIN)
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="sku"
            placeholder="Ex: 7891234567890"
            value={formData.sku}
            onChange={(e) => updateFormData("sku", e.target.value)}
            className={errors.sku ? "border-red-500" : formData.sku ? "border-imperial" : ""}
          />
          {errors.sku && <p className="text-sm text-red-500 mt-1">{errors.sku}</p>}
        </div>

        {/* Description */}
        <div className="col-span-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            Descrição
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Ex: Iogurte Natural Integral 170g"
            value={formData.description}
            onChange={(e) => updateFormData("description", e.target.value)}
            rows={3}
            maxLength={200}
            className={errors.description ? "border-red-500" : ""}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            <p className="text-sm text-muted-foreground ml-auto">{formData.description.length}/200</p>
          </div>
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category" className="flex items-center gap-2">
            Categoria
            <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
            <SelectTrigger className={errors.category ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fresco">Fresco</SelectItem>
              <SelectItem value="Seco">Seco</SelectItem>
              <SelectItem value="Congelado">Congelado</SelectItem>
              <SelectItem value="Bebidas">Bebidas</SelectItem>
              <SelectItem value="Limpeza">Limpeza</SelectItem>
              <SelectItem value="Higiene">Higiene</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
        </div>

        {/* Unit */}
        <div>
          <Label htmlFor="unit" className="flex items-center gap-2">
            Unidade de Medida
            <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.unit} onValueChange={(value) => updateFormData("unit", value)}>
            <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecione uma unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UN">UN (Unidade)</SelectItem>
              <SelectItem value="CX">CX (Caixa)</SelectItem>
              <SelectItem value="KG">KG (Quilograma)</SelectItem>
              <SelectItem value="L">L (Litro)</SelectItem>
              <SelectItem value="PCT">PCT (Pacote)</SelectItem>
              <SelectItem value="PALETE">PALETE</SelectItem>
            </SelectContent>
          </Select>
          {errors.unit && <p className="text-sm text-red-500 mt-1">{errors.unit}</p>}
        </div>

        {/* Pack Size */}
        <div>
          <Label htmlFor="packSize">Tamanho do Pack</Label>
          <Input
            id="packSize"
            placeholder="Ex: 12x170g ou 1x5kg"
            value={formData.packSize}
            onChange={(e) => updateFormData("packSize", e.target.value)}
          />
          <p className="text-sm text-muted-foreground mt-1">Formato sugerido: quantidade x peso/volume unitário</p>
        </div>

        {/* Brand */}
        <div>
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            placeholder="Ex: Danone"
            value={formData.brand}
            onChange={(e) => updateFormData("brand", e.target.value)}
          />
        </div>

        {/* Internal Barcode */}
        <div>
          <Label htmlFor="internalBarcode">Código de Barras Interno</Label>
          <Input
            id="internalBarcode"
            placeholder="Código interno adicional"
            value={formData.internalBarcode}
            onChange={(e) => updateFormData("internalBarcode", e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            placeholder="Informações adicionais sobre o produto"
            value={formData.notes}
            onChange={(e) => updateFormData("notes", e.target.value)}
            rows={2}
          />
        </div>

        {/* Status */}
        <div className="col-span-2">
          <div className="flex items-center gap-3">
            <Switch
              id="status"
              checked={formData.status}
              onCheckedChange={(checked) => updateFormData("status", checked)}
            />
            <Label htmlFor="status" className="cursor-pointer">
              Produto Ativo
            </Label>
            {formData.status && <Badge className="bg-imperial">Ativo</Badge>}
          </div>
        </div>
      </div>
    </div>
  )
}





