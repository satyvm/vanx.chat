import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vanx/ui/components/select";

export function ModelSelector({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Model" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="gemini-2.5-flash">Gemini Flash</SelectItem>
        <SelectItem value="gemini-3-pro">Gemini Pro</SelectItem>
      </SelectContent>
    </Select>
  );
}
