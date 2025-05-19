import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EntryRecord } from "@/hooks/useReportData";

interface EntryEditFormProps {
  entry: EntryRecord;
  onChange: (updatedEntry: EntryRecord) => void;
}

export const EntryEditForm: React.FC<EntryEditFormProps> = ({
  entry,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...entry,
      [name]: value,
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...entry,
      [name]: value === "" ? 0 : parseFloat(value),
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...entry,
      [name]: value ? new Date(value) : null,
    });
  };

  return (
    <div className="grid gap-4 grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={entry.date ? entry.date.toISOString().split("T")[0] : ""}
          onChange={handleDateChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="producerId">Código COMAPI do Produtor</Label>
        <Input
          id="producerId"
          name="producerId"
          value={entry.producerId || ""}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="municipality">Município</Label>
        <Input
          id="municipality"
          name="municipality"
          value={entry.municipality || ""}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="community">Comunidade</Label>
        <Input
          id="community"
          name="community"
          value={entry.community || ""}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lot">Lote</Label>
        <Input
          id="lot"
          name="lot"
          value={entry.lot || ""}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="anal">Anal.</Label>
        <Input
          id="anal"
          name="anal"
          value={entry.anal || ""}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="colorCode">Código da Cor</Label>
        <Input
          id="colorCode"
          name="colorCode"
          value={entry.colorCode || ""}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="netWeight">Peso Líquido (kg)</Label>
        <Input
          id="netWeight"
          name="netWeight"
          type="number"
          step="0.01"
          value={entry.netWeight || 0}
          onChange={handleNumberChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="unitValue">Valor Unitário (R$)</Label>
        <Input
          id="unitValue"
          name="unitValue"
          type="number"
          step="0.01"
          value={entry.unitValue || 0}
          onChange={handleNumberChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="totalValue">Valor Total (R$)</Label>
        <Input
          id="totalValue"
          name="totalValue"
          type="number"
          step="0.01"
          value={entry.totalValue || 0}
          onChange={handleNumberChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="quantity">Quantidade</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          value={entry.quantity || 0}
          onChange={handleNumberChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="grossWeight">Peso Bruto (kg)</Label>
        <Input
          id="grossWeight"
          name="grossWeight"
          type="number"
          step="0.01"
          value={entry.grossWeight || 0}
          onChange={handleNumberChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tare">Tara (kg)</Label>
        <Input
          id="tare"
          name="tare"
          type="number"
          step="0.01"
          value={entry.tare || 0}
          onChange={handleNumberChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="totalTare">Tara Total (kg)</Label>
        <Input
          id="totalTare"
          name="totalTare"
          type="number"
          step="0.01"
          value={entry.totalTare || 0}
          onChange={handleNumberChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="humidity">Umidade (%)</Label>
        <Input
          id="humidity"
          name="humidity"
          type="number"
          step="0.01"
          value={entry.humidity || 0}
          onChange={handleNumberChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="apiary">Apiário</Label>
        <Input
          id="apiary"
          name="apiary"
          value={entry.apiary || ""}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contract">Contrato</Label>
        <Input
          id="contract"
          name="contract"
          value={entry.contract || ""}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="invoiceNumber">Número da Nota Fiscal</Label>
        <Input
          id="invoiceNumber"
          name="invoiceNumber"
          value={entry.invoiceNumber || ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default EntryEditForm;
