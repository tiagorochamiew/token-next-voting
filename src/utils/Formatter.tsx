export function formatFieldName(name: string): string {
  return name
    .toLowerCase()
    .replace("image url", "url")
    .split(" ")
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");
}
