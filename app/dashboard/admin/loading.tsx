export default function AdminLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="h-8 bg-muted rounded w-64 mb-2"></div>
        <div className="h-4 bg-muted rounded w-96"></div>
      </div>

      <div className="space-y-6">
        <div className="h-10 bg-muted rounded"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  )
}
