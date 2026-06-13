"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { SupplierFormData } from "@/components/features/registrations/supplier-form-content"

interface GeneralSupplierTabProps {
  formData: SupplierFormData
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
}

export function GeneralSupplierTab({ formData, updateFormData, errors }: GeneralSupplierTabProps) {
  const handleBillingAddressChange = (field: string, value: string) => {
    updateFormData("billingAddress", {
      ...formData.billingAddress,
      [field]: value,
    })
  }

  const handleDeliveryAddressChange = (field: string, value: string) => {
    updateFormData("deliveryAddress", {
      ...formData.deliveryAddress,
      [field]: value,
    })
  }

  const handleSameAsBillingChange = (checked: boolean) => {
    updateFormData("deliveryAddress", {
      ...formData.deliveryAddress,
      sameAsBilling: checked,
      ...(checked ? formData.billingAddress : {}),
    })
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>Dados principais do fornecedor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Razão Social <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateFormData("companyName", e.target.value)}
                className={errors.companyName ? "border-red-500" : ""}
              />
              {errors.companyName && <p className="text-sm text-red-500">{errors.companyName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradeName">Nome Fantasia</Label>
              <Input
                id="tradeName"
                value={formData.tradeName}
                onChange={(e) => updateFormData("tradeName", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nuit">
                NUIT <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nuit"
                value={formData.nuit}
                onChange={(e) => updateFormData("nuit", e.target.value)}
                className={errors.nuit ? "border-red-500" : ""}
              />
              {errors.nuit && <p className="text-sm text-red-500">{errors.nuit}</p>}
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <RadioGroup value={formData.type} onValueChange={(value) => updateFormData("type", value)}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="juridica" id="juridica" />
                    <Label htmlFor="juridica">Pessoa Jurídica</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fisica" id="fisica" />
                    <Label htmlFor="fisica">Pessoa Física</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contatos</CardTitle>
          <CardDescription>Informações de contato do fornecedor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryEmail">
                Email Principal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="primaryEmail"
                type="email"
                value={formData.primaryEmail}
                onChange={(e) => updateFormData("primaryEmail", e.target.value)}
                className={errors.primaryEmail ? "border-red-500" : ""}
              />
              {errors.primaryEmail && <p className="text-sm text-red-500">{errors.primaryEmail}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryEmail">Email Secundário</Label>
              <Input
                id="secondaryEmail"
                type="email"
                value={formData.secondaryEmail}
                onChange={(e) => updateFormData("secondaryEmail", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryPhone">
                Telefone Principal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="primaryPhone"
                value={formData.primaryPhone}
                onChange={(e) => updateFormData("primaryPhone", e.target.value)}
                className={errors.primaryPhone ? "border-red-500" : ""}
              />
              {errors.primaryPhone && <p className="text-sm text-red-500">{errors.primaryPhone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryPhone">Telefone Secundário</Label>
              <Input
                id="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={(e) => updateFormData("secondaryPhone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData("website", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço de Cobrança</CardTitle>
          <CardDescription>Endereço para emissão de faturas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="billingStreet">
                Rua/Avenida <span className="text-red-500">*</span>
              </Label>
              <Input
                id="billingStreet"
                value={formData.billingAddress.street}
                onChange={(e) => handleBillingAddressChange("street", e.target.value)}
                className={errors.billingStreet ? "border-red-500" : ""}
              />
              {errors.billingStreet && <p className="text-sm text-red-500">{errors.billingStreet}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingNumber">Número</Label>
              <Input
                id="billingNumber"
                value={formData.billingAddress.number}
                onChange={(e) => handleBillingAddressChange("number", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingComplement">Complemento</Label>
              <Input
                id="billingComplement"
                value={formData.billingAddress.complement}
                onChange={(e) => handleBillingAddressChange("complement", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingNeighborhood">
                Bairro <span className="text-red-500">*</span>
              </Label>
              <Input
                id="billingNeighborhood"
                value={formData.billingAddress.neighborhood}
                onChange={(e) => handleBillingAddressChange("neighborhood", e.target.value)}
                className={errors.billingNeighborhood ? "border-red-500" : ""}
              />
              {errors.billingNeighborhood && <p className="text-sm text-red-500">{errors.billingNeighborhood}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingCity">
                Cidade <span className="text-red-500">*</span>
              </Label>
              <Input
                id="billingCity"
                value={formData.billingAddress.city}
                onChange={(e) => handleBillingAddressChange("city", e.target.value)}
                className={errors.billingCity ? "border-red-500" : ""}
              />
              {errors.billingCity && <p className="text-sm text-red-500">{errors.billingCity}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingProvince">
                Província <span className="text-red-500">*</span>
              </Label>
              <Input
                id="billingProvince"
                value={formData.billingAddress.province}
                onChange={(e) => handleBillingAddressChange("province", e.target.value)}
                className={errors.billingProvince ? "border-red-500" : ""}
              />
              {errors.billingProvince && <p className="text-sm text-red-500">{errors.billingProvince}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingZipCode">CEP</Label>
              <Input
                id="billingZipCode"
                value={formData.billingAddress.zipCode}
                onChange={(e) => handleBillingAddressChange("zipCode", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingCountry">País</Label>
            <Input
              id="billingCountry"
              value={formData.billingAddress.country}
              onChange={(e) => handleBillingAddressChange("country", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço de Entrega</CardTitle>
          <CardDescription>Endereço para recebimento de mercadorias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="sameAsBilling"
              checked={formData.deliveryAddress.sameAsBilling}
              onCheckedChange={handleSameAsBillingChange}
            />
            <Label htmlFor="sameAsBilling">Mesmo endereço de cobrança</Label>
          </div>

          {!formData.deliveryAddress.sameAsBilling && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="deliveryStreet">Rua/Avenida</Label>
                  <Input
                    id="deliveryStreet"
                    value={formData.deliveryAddress.street}
                    onChange={(e) => handleDeliveryAddressChange("street", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryNumber">Número</Label>
                  <Input
                    id="deliveryNumber"
                    value={formData.deliveryAddress.number}
                    onChange={(e) => handleDeliveryAddressChange("number", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryComplement">Complemento</Label>
                  <Input
                    id="deliveryComplement"
                    value={formData.deliveryAddress.complement}
                    onChange={(e) => handleDeliveryAddressChange("complement", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryNeighborhood">Bairro</Label>
                  <Input
                    id="deliveryNeighborhood"
                    value={formData.deliveryAddress.neighborhood}
                    onChange={(e) => handleDeliveryAddressChange("neighborhood", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryCity">Cidade</Label>
                  <Input
                    id="deliveryCity"
                    value={formData.deliveryAddress.city}
                    onChange={(e) => handleDeliveryAddressChange("city", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryProvince">Província</Label>
                  <Input
                    id="deliveryProvince"
                    value={formData.deliveryAddress.province}
                    onChange={(e) => handleDeliveryAddressChange("province", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryZipCode">CEP</Label>
                  <Input
                    id="deliveryZipCode"
                    value={formData.deliveryAddress.zipCode}
                    onChange={(e) => handleDeliveryAddressChange("zipCode", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryCountry">País</Label>
                <Input
                  id="deliveryCountry"
                  value={formData.deliveryAddress.country}
                  onChange={(e) => handleDeliveryAddressChange("country", e.target.value)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Status and Situation */}
      <Card>
        <CardHeader>
          <CardTitle>Status e Situação</CardTitle>
          <CardDescription>Controle de situação do fornecedor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="status">Status</Label>
              <p className="text-sm text-muted-foreground">Ativo ou inativo no sistema</p>
            </div>
            <Switch id="status" checked={formData.status} onCheckedChange={(checked) => updateFormData("status", checked)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="situation">Situação</Label>
            <Select value={formData.situation} onValueChange={(value) => updateFormData("situation", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bloqueado">Bloqueado</SelectItem>
                <SelectItem value="avaliacao">Em Avaliação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.situation === "bloqueado" && (
            <div className="space-y-2">
              <Label htmlFor="blockReason">Motivo do Bloqueio</Label>
              <Textarea
                id="blockReason"
                value={formData.blockReason}
                onChange={(e) => updateFormData("blockReason", e.target.value)}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




