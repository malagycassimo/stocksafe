"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Upload, FileText } from "lucide-react"
import { SupplierFormData } from "@/components/features/registrations/supplier-form-content"

interface DocumentsTabProps {
  formData: SupplierFormData
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
}

export function DocumentsTab({ formData, updateFormData, errors }: DocumentsTabProps) {
  const handleCertificationChange = (cert: string, checked: boolean) => {
    updateFormData("certifications", {
      ...formData.certifications,
      [cert]: checked,
    })
  }

  const addCertificationDetail = () => {
    updateFormData("certificationDetails", [
      ...formData.certificationDetails,
      {
        type: "",
        number: "",
        issueDate: "",
        expiryDate: "",
        file: "",
        issuer: "",
      },
    ])
  }

  const removeCertificationDetail = (index: number) => {
    const updated = formData.certificationDetails.filter((_, i) => i !== index)
    updateFormData("certificationDetails", updated)
  }

  const updateCertificationDetail = (index: number, field: string, value: string) => {
    const updated = [...formData.certificationDetails]
    updated[index] = { ...updated[index], [field]: value }
    updateFormData("certificationDetails", updated)
  }

  const addDatasheet = () => {
    updateFormData("datasheets", [
      ...formData.datasheets,
      {
        product: "",
        type: "",
        file: "",
        version: "",
        uploadDate: new Date().toISOString().split("T")[0],
      },
    ])
  }

  const removeDatasheet = (index: number) => {
    const updated = formData.datasheets.filter((_, i) => i !== index)
    updateFormData("datasheets", updated)
  }

  const updateDatasheet = (index: number, field: string, value: string) => {
    const updated = [...formData.datasheets]
    updated[index] = { ...updated[index], [field]: value }
    updateFormData("datasheets", updated)
  }

  const addAdditionalDocument = () => {
    updateFormData("additionalDocuments", [
      ...formData.additionalDocuments,
      {
        name: "",
        type: "",
        file: "",
        uploadDate: new Date().toISOString().split("T")[0],
      },
    ])
  }

  const removeAdditionalDocument = (index: number) => {
    const updated = formData.additionalDocuments.filter((_, i) => i !== index)
    updateFormData("additionalDocuments", updated)
  }

  const updateAdditionalDocument = (index: number, field: string, value: string) => {
    const updated = [...formData.additionalDocuments]
    updated[index] = { ...updated[index], [field]: value }
    updateFormData("additionalDocuments", updated)
  }

  return (
    <div className="space-y-6">
      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>Certificações</CardTitle>
          <CardDescription>Certificações e qualificações do fornecedor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="iso9001"
                checked={formData.certifications.iso9001}
                onCheckedChange={(checked) => handleCertificationChange("iso9001", checked as boolean)}
              />
              <Label htmlFor="iso9001">ISO 9001</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="iso22000"
                checked={formData.certifications.iso22000}
                onCheckedChange={(checked) => handleCertificationChange("iso22000", checked as boolean)}
              />
              <Label htmlFor="iso22000">ISO 22000</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="haccp"
                checked={formData.certifications.haccp}
                onCheckedChange={(checked) => handleCertificationChange("haccp", checked as boolean)}
              />
              <Label htmlFor="haccp">HACCP</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="organic"
                checked={formData.certifications.organic}
                onCheckedChange={(checked) => handleCertificationChange("organic", checked as boolean)}
              />
              <Label htmlFor="organic">Orgânico</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="kosher"
                checked={formData.certifications.kosher}
                onCheckedChange={(checked) => handleCertificationChange("kosher", checked as boolean)}
              />
              <Label htmlFor="kosher">Kosher</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="halal"
                checked={formData.certifications.halal}
                onCheckedChange={(checked) => handleCertificationChange("halal", checked as boolean)}
              />
              <Label htmlFor="halal">Halal</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="others"
                checked={formData.certifications.others}
                onCheckedChange={(checked) => handleCertificationChange("others", checked as boolean)}
              />
              <Label htmlFor="others">Outras</Label>
            </div>
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <Label>Detalhes das Certificações</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCertificationDetail}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {formData.certificationDetails.map((cert, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Certificação {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertificationDetail(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={cert.type}
                      onValueChange={(value) => updateCertificationDetail(index, "type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ISO 9001">ISO 9001</SelectItem>
                        <SelectItem value="ISO 22000">ISO 22000</SelectItem>
                        <SelectItem value="HACCP">HACCP</SelectItem>
                        <SelectItem value="Orgânico">Orgânico</SelectItem>
                        <SelectItem value="Kosher">Kosher</SelectItem>
                        <SelectItem value="Halal">Halal</SelectItem>
                        <SelectItem value="Outra">Outra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input
                      value={cert.number}
                      onChange={(e) => updateCertificationDetail(index, "number", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Emissão</Label>
                    <Input
                      type="date"
                      value={cert.issueDate}
                      onChange={(e) => updateCertificationDetail(index, "issueDate", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Validade</Label>
                    <Input
                      type="date"
                      value={cert.expiryDate}
                      onChange={(e) => updateCertificationDetail(index, "expiryDate", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Emissor</Label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) => updateCertificationDetail(index, "issuer", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Arquivo</Label>
                    <Button type="button" variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Datasheets */}
      <Card>
        <CardHeader>
          <CardTitle>Fichas Técnicas</CardTitle>
          <CardDescription>Fichas técnicas e especificações de produtos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Label>Lista de Fichas Técnicas</Label>
            <Button type="button" variant="outline" size="sm" onClick={addDatasheet}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {formData.datasheets.map((datasheet, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Ficha Técnica {index + 1}</h4>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeDatasheet(index)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Input
                    value={datasheet.product}
                    onChange={(e) => updateDatasheet(index, "product", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={datasheet.type} onValueChange={(value) => updateDatasheet(index, "type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FT">Ficha Técnica</SelectItem>
                      <SelectItem value="FISPQ">FISPQ</SelectItem>
                      <SelectItem value="Especificação">Especificação</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Versão</Label>
                  <Input
                    value={datasheet.version}
                    onChange={(e) => updateDatasheet(index, "version", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data de Upload</Label>
                  <Input type="date" value={datasheet.uploadDate} readOnly disabled />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Arquivo</Label>
                  <Button type="button" variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Additional Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Adicionais</CardTitle>
          <CardDescription>Outros documentos relevantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Label>Lista de Documentos</Label>
            <Button type="button" variant="outline" size="sm" onClick={addAdditionalDocument}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {formData.additionalDocuments.map((doc, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Documento {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAdditionalDocument(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={doc.name}
                    onChange={(e) => updateAdditionalDocument(index, "name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Input
                    value={doc.type}
                    onChange={(e) => updateAdditionalDocument(index, "type", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data de Upload</Label>
                  <Input type="date" value={doc.uploadDate} readOnly disabled />
                </div>

                <div className="space-y-2">
                  <Label>Arquivo</Label>
                  <Button type="button" variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}




