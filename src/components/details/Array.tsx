export function ArrayDetail({
  label,
  values,
}: {
  label: string;
  values: (string | number)[];
}) {
  if (!values?.length) return null;

  return (
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
      <ul className="list-disc list-inside space-y-1">
        {values.map((value, index) => (
          <li key={index} className="text-sm text-black">
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}
