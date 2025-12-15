export default function CarTypesStatusBadge({ status }) {
  const byte = Number(status);

  const css =
    byte === 1
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  const label = byte === 1 ? "Active" : "Inactive";

  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${css}`}>
      {label}
    </span>
  );
}
