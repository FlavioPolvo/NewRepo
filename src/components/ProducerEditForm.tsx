import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Producer } from "@/hooks/useReportData";

interface ProducerEditFormProps {
  producer: Producer;
  onChange: (updatedProducer: Producer) => void;
}

export const ProducerEditForm: React.FC<ProducerEditFormProps> = ({
  producer,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...producer,
      [name]: value,
    });
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          value={producer.name || ""}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="cod_na_comapi">Código COMAPI</Label>
        <Input
          id="cod_na_comapi"
          name="cod_na_comapi"
          value={producer.cod_na_comapi || ""}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="municipality">Município</Label>
        <Input
          id="municipality"
          name="municipality"
          value={producer.municipality || ""}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="community">Comunidade</Label>
        <Input
          id="community"
          name="community"
          value={producer.community || ""}
          onChange={handleChange}
        />
      </div>
      {/* Adicionar outros campos conforme necessário */}
    </div>
  );
};

export default ProducerEditForm;
