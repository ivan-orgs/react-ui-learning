export function Time({ value }: { value: Date | string }) {
  const date = typeof value === "string" ? new Date(value) : value;

  return <time dateTime={date.toISOString()}>{new Intl.DateTimeFormat("en-IN").format(date)}</time>;
}


