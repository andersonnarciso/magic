export default function Loading() {
  return (
    <div className="w-full animate-pulse">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}
