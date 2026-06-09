import { Surface } from "../../../shared/ui/Surface";
import { PriorityBadge } from "./PriorityBadge";

interface MetricWidgetProps {
  title: string;
  value: string;
  helpText: string;
}

export function MetricWidget({ title, value, helpText }: MetricWidgetProps) {
  return (
    // Concept: reusable feature block.
    // What it means: several widgets share the same layout but pass different props.
    // Seen in app: priority and confidence widgets both use this MetricWidget component.
    <Surface title={title}>
      <PriorityBadge value={value} />
      <p>{helpText}</p>
    </Surface>
  );
}




