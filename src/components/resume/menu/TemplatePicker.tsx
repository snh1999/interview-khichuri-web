import {
  TEMPLATES,
  type TTemplateKey,
} from "@/components/resume/template-registry.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

interface IProps {
  templateId: TTemplateKey;
  onChange: (next: TTemplateKey) => void;
  disabled?: boolean;
}
export const TemplatePicker = ({ templateId, onChange, disabled }: IProps) => {
  const handleChange = (value: TTemplateKey | null) => {
    if (!value) {
      return;
    }
    onChange(value);
  };
  return (
    <Select disabled={disabled} onValueChange={handleChange} value={templateId}>
      <SelectTrigger className="w-full">
        <SelectValue>
          {TEMPLATES.find((t) => t.id === templateId)?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {TEMPLATES.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            {t.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
