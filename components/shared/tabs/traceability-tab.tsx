"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import type { ProductFormData } from "@/components/features/registrations/product-form-content"

interface TraceabilityTabProps {
  formData: ProductFormData
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
}

export function TraceabilityTab({ formData, updateFormData, errors }: TraceabilityTabProps) {
  const handleLotRequiredToggle = (field: string, checked: boolean) => {
    const newLotRequired = checked
      ? [...formData.lotRequiredIn, field]
      : formData.lotRequiredIn.filter((f) => f !== field)
    updateFormData("lotRequiredIn", newLotRequired)
  }

  const isFoodCategory = ["Fresco", "Congelado", "Bebidas"].includes(formData.category)

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Search className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Rastreabilidade garante controle completo do lote desde a entrada até a saída
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Lot Control */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                id="lotControl"
                checked={formData.lotControl}
                onCheckedChange={(checked) => updateFormData("lotControl", checked)}
                disabled={isFoodCategory}
                className="data-[state=checked]:bg-imperial"
              />
              <Label htmlFor="lotControl" className="cursor-pointer text-lg font-semibold">
                Ativar controle por lote
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {isFoodCategory ? (
                <span className="text-yellow-700">
                  ⚠️ Obrigatório para produtos alimentícios conforme regulamentação
                </span>
              ) : (
                "Recomendado para rastreabilidade completa"
              )}
            </p>
          </div>

          {/* Lot Format */}
          {formData.lotControl && (
            <>
              <div className="space-y-4">
                <Label>Formato do Lote</Label>
                <RadioGroup
                  value={formData.lotFormat}
                  onValueChange={(value: "free" | "specific") => updateFormData("lotFormat", value)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <RadioGroupItem value="free" id="free" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="free" className="cursor-pointer font-medium">
                          Alfanumérico livre
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aceita qualquer combinação de letras e números
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Exemplo: L123ABC, 2024-01-A, LOT456</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <RadioGroupItem value="specific" id="specific" className="mt-1" />
                      <div className="flex-1 space-y-3">
                        <Label htmlFor="specific" className="cursor-pointer font-medium">
                          Formato específico (padrão sugerido)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Exemplos de máscaras: AAAA-NNNN (4 letras + 4 números), LNNNNNN (L + 6 números), NNNN/NN
                          (ano/lote)
                        </p>
                        {formData.lotFormat === "specific" && (
                          <div>
                            <Label htmlFor="lotMask" className="text-sm">
                              Máscara:
                            </Label>
                            <Input
                              id="lotMask"
                              placeholder="Ex: AAAA-NNNN"
                              value={formData.lotMask}
                              onChange={(e) => updateFormData("lotMask", e.target.value)}
                            />
                            <p className="text-sm text-muted-foreground mt-1">A = Letra, N = Número, - = Separador</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </RadioGroup>
                <p className="text-sm text-muted-foreground">Define o padrão esperado para validação no recebimento</p>
              </div>

              {/* Lot Required In */}
              <div className="space-y-3">
                <Label>Lote obrigatório em:</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Checkbox id="lot-recebimento" checked disabled />
                    <Label htmlFor="lot-recebimento" className="cursor-not-allowed opacity-50 font-normal">
                      Recebimento (sempre obrigatório)
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="lot-movimentacoes"
                      checked={formData.lotRequiredIn.includes("movimentacoes")}
                      onCheckedChange={(checked) => handleLotRequiredToggle("movimentacoes", checked as boolean)}
                    />
                    <Label htmlFor="lot-movimentacoes" className="cursor-pointer font-normal">
                      Movimentações internas
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="lot-expedicao"
                      checked={formData.lotRequiredIn.includes("expedicao")}
                      onCheckedChange={(checked) => handleLotRequiredToggle("expedicao", checked as boolean)}
                    />
                    <Label htmlFor="lot-expedicao" className="cursor-pointer font-normal">
                      Expedição
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="lot-inventario"
                      checked={formData.lotRequiredIn.includes("inventario")}
                      onCheckedChange={(checked) => handleLotRequiredToggle("inventario", checked as boolean)}
                    />
                    <Label htmlFor="lot-inventario" className="cursor-pointer font-normal">
                      Inventário
                    </Label>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Sistema bloqueará operações sem informar o lote</p>
              </div>

              {/* Additional Traceability */}
              <div className="space-y-3">
                <Label>Rastreabilidade Adicional:</Label>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="requireDatasheet"
                      checked={formData.requireDatasheet}
                      onCheckedChange={(checked) => updateFormData("requireDatasheet", checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="requireDatasheet" className="cursor-pointer font-normal">
                        Exigir Datasheet/CoA no recebimento
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Campo de Datasheet torna-se obrigatório na conferência
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="trackBySerial"
                      checked={formData.trackBySerial}
                      onCheckedChange={(checked) => updateFormData("trackBySerial", checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="trackBySerial" className="cursor-pointer font-normal">
                        Rastrear por número de série
                      </Label>
                      <p className="text-sm text-muted-foreground">Para itens unitários de alto valor</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="requireCertifications"
                      checked={formData.requireCertifications}
                      onCheckedChange={(checked) => updateFormData("requireCertifications", checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="requireCertifications" className="cursor-pointer font-normal">
                        Vincular a certificações específicas
                      </Label>
                      <p className="text-sm text-muted-foreground">ISO 9001, HACCP, Orgânico, Kosher, Halal, Outros</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quarantine Time */}
              <div>
                <Label htmlFor="quarantineDays">Tempo de Quarentena Padrão</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="quarantineDays"
                    type="number"
                    placeholder="Ex: 3"
                    value={formData.quarantineDays || ""}
                    onChange={(e) => updateFormData("quarantineDays", Number(e.target.value))}
                    min={0}
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">dias</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Produtos ficarão bloqueados até liberação da QA</p>
              </div>
            </>
          )}
        </div>

        {/* Visual Example */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="font-semibold mb-4">Exemplo de Rastreabilidade</h3>
            <div className="space-y-4">
              {/* Flowchart */}
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Fornecedor</p>
                    <p className="text-muted-foreground text-xs">Origem do produto</p>
                  </div>
                </div>

                <div className="ml-4 border-l-2 border-imperial h-6" />

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-twilight rounded-full flex items-center justify-center text-imperial font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Lote L123</p>
                    <p className="text-muted-foreground text-xs">Identificação única</p>
                  </div>
                </div>

                <div className="ml-4 border-l-2 border-imperial h-6" />

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-twilight rounded-full flex items-center justify-center text-imperial font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Recebimento</p>
                    <p className="text-muted-foreground text-xs">Entrada no estoque</p>
                  </div>
                </div>

                <div className="ml-4 border-l-2 border-imperial h-6" />

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-twilight rounded-full flex items-center justify-center text-imperial font-semibold">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Estoque</p>
                    <p className="text-muted-foreground text-xs">Armazenagem</p>
                  </div>
                </div>

                <div className="ml-4 border-l-2 border-imperial h-6" />

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-twilight rounded-full flex items-center justify-center text-imperial font-semibold">
                    5
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Expedição</p>
                    <p className="text-muted-foreground text-xs">Saída para cliente</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Com rastreabilidade ativa, você pode localizar qualquer item desde sua origem
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}





