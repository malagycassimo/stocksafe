"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ProductFormData } from "@/components/features/registrations/product-form-content"

interface GeneralTabProps {
  formData: ProductFormData
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
}

export function GeneralTab({ formData, updateFormData, errors }: GeneralTabProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>Dados principais do produto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">
                SKU <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => updateFormData("sku", e.target.value)}
                className={errors.sku ? "border-red-500" : ""}
                placeholder="Ex: ALM-001"
              />
              {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="internalBarcode">Código de Barras Interno</Label>
              <Input
                id="internalBarcode"
                value={formData.internalBarcode}
                onChange={(e) => updateFormData("internalBarcode", e.target.value)}
                placeholder="Ex: 7891234567890"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descrição <span className="text-red-500">*</span>
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              placeholder="Ex: Arroz Branco Tipo 1 - Pacote 5kg"
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Categoria <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Seco">Seco</SelectItem>
                  <SelectItem value="Refrigerado">Refrigerado</SelectItem>
                  <SelectItem value="Congelado">Congelado</SelectItem>
                  <SelectItem value="Fresco">Fresco</SelectItem>
                  <SelectItem value="Laticínios">Laticínios</SelectItem>
                  <SelectItem value="Bebidas">Bebidas</SelectItem>
                  <SelectItem value="Higiene">Higiene e Limpeza</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">
                Unidade <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.unit} onValueChange={(value) => updateFormData("unit", value)}>
                <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UN">Unidade</SelectItem>
                  <SelectItem value="CX">Caixa</SelectItem>
                  <SelectItem value="KG">Quilograma</SelectItem>
                  <SelectItem value="L">Litro</SelectItem>
                  <SelectItem value="PC">Peça</SelectItem>
                  <SelectItem value="PALLET">Pallet</SelectItem>
                </SelectContent>
              </Select>
              {errors.unit && <p className="text-sm text-red-500">{errors.unit}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="packSize">Tamanho da Embalagem</Label>
              <Input
                id="packSize"
                value={formData.packSize}
                onChange={(e) => updateFormData("packSize", e.target.value)}
                placeholder="Ex: 1x5kg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Marca</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => updateFormData("brand", e.target.value)}
              placeholder="Ex: Marca Exemplo"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
          <CardDescription>Observações e configurações extras</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData("notes", e.target.value)}
              rows={4}
              placeholder="Adicione informações relevantes sobre o produto..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="status">Status</Label>
              <p className="text-sm text-muted-foreground">Produto ativo no sistema</p>
            </div>
            <Switch id="status" checked={formData.status} onCheckedChange={(checked) => updateFormData("status", checked)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




