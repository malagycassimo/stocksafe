"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { SupplierFormData } from "@/components/features/registrations/supplier-form-content"

interface ConditionsTabProps {
  formData: SupplierFormData
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
}

export function ConditionsTab({ formData, updateFormData, errors }: ConditionsTabProps) {
  const paymentMethods = ["Transferência Bancária", "Boleto", "Cartão", "Cheque", "Dinheiro"]
  const categories = [
    "Alimentos Frescos",
    "Alimentos Congelados",
    "Bebidas",
    "Higiene e Limpeza",
    "Embalagens",
    "Equipamentos",
    "Outros",
  ]

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    const updated = checked
      ? [...formData.paymentMethod, method]
      : formData.paymentMethod.filter((m) => m !== method)
    updateFormData("paymentMethod", updated)
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    const updated = checked
      ? [...formData.categories, category]
      : formData.categories.filter((c) => c !== category)
    updateFormData("categories", updated)
  }

  return (
    <div className="space-y-6">
      {/* Commercial Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Condições Comerciais</CardTitle>
          <CardDescription>Termos e condições de negociação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incoterm">Incoterm</Label>
              <Select value={formData.incoterm} onValueChange={(value) => updateFormData("incoterm", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                  <SelectItem value="FCA">FCA - Free Carrier</SelectItem>
                  <SelectItem value="CPT">CPT - Carriage Paid To</SelectItem>
                  <SelectItem value="CIP">CIP - Carriage and Insurance Paid</SelectItem>
                  <SelectItem value="DAP">DAP - Delivered at Place</SelectItem>
                  <SelectItem value="DPU">DPU - Delivered at Place Unloaded</SelectItem>
                  <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                  <SelectItem value="FAS">FAS - Free Alongside Ship</SelectItem>
                  <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                  <SelectItem value="CFR">CFR - Cost and Freight</SelectItem>
                  <SelectItem value="CIF">CIF - Cost, Insurance and Freight</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerm">Prazo de Pagamento (dias)</Label>
              <Select value={formData.paymentTerm} onValueChange={(value) => updateFormData("paymentTerm", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">À vista</SelectItem>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="15">15 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="45">45 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select value={formData.currency} onValueChange={(value) => updateFormData("currency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MT">MT - Metical</SelectItem>
                  <SelectItem value="USD">USD - Dólar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="ZAR">ZAR - Rand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Desconto (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.discount}
                onChange={(e) => updateFormData("discount", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryTime">Prazo de Entrega (dias)</Label>
              <Input
                id="deliveryTime"
                type="number"
                min="0"
                value={formData.deliveryTime}
                onChange={(e) => updateFormData("deliveryTime", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Formas de Pagamento</Label>
            <div className="grid grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <div key={method} className="flex items-center space-x-2">
                  <Checkbox
                    id={`payment-${method}`}
                    checked={formData.paymentMethod.includes(method)}
                    onCheckedChange={(checked) => handlePaymentMethodChange(method, checked as boolean)}
                  />
                  <Label htmlFor={`payment-${method}`}>{method}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Limites Financeiros</CardTitle>
          <CardDescription>Valores mínimos e máximos de negociação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minOrderValue">Valor Mínimo de Pedido ({formData.currency})</Label>
              <Input
                id="minOrderValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.minOrderValue}
                onChange={(e) => updateFormData("minOrderValue", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxCreditValue">Valor Máximo de Crédito ({formData.currency})</Label>
              <Input
                id="maxCreditValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.maxCreditValue}
                onChange={(e) => updateFormData("maxCreditValue", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance SLAs */}
      <Card>
        <CardHeader>
          <CardTitle>SLAs de Performance</CardTitle>
          <CardDescription>Acordos de nível de serviço</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rfqResponseSla">Resposta a Cotação (horas)</Label>
              <Input
                id="rfqResponseSla"
                type="number"
                min="0"
                value={formData.rfqResponseSla}
                onChange={(e) => updateFormData("rfqResponseSla", parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lotValiditySla">Validade de Lote (horas)</Label>
              <Input
                id="lotValiditySla"
                type="number"
                min="0"
                value={formData.lotValiditySla}
                onChange={(e) => updateFormData("lotValiditySla", parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="averageLeadTime">Lead Time Médio (dias)</Label>
              <Input
                id="averageLeadTime"
                type="number"
                min="0"
                value={formData.averageLeadTime}
                onChange={(e) => updateFormData("averageLeadTime", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories and Products */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Produtos</CardTitle>
          <CardDescription>Categorias de produtos fornecidos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Categorias</Label>
            <div className="grid grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={formData.categories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  />
                  <Label htmlFor={`category-${category}`}>{category}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryNotes">Observações sobre Categorias</Label>
            <Textarea
              id="categoryNotes"
              value={formData.categoryNotes}
              onChange={(e) => updateFormData("categoryNotes", e.target.value)}
              rows={4}
              placeholder="Adicione observações sobre as categorias de produtos, especialidades ou restrições..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




