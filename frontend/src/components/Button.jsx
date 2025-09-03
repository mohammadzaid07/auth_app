export default function Button({
  text,
  onClick,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg ${className}`}
    >
      {text}
    </button>
  );
}
