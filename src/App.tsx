export function App() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4">
          <span aria-hidden="true" className="text-2xl">
            ✅
          </span>
          <h1 className="text-xl font-semibold tracking-tight">Habit Tracker</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <section
          aria-labelledby="empty-title"
          className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center"
        >
          <h2 id="empty-title" className="text-lg font-medium">
            No habits yet
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Habits you track will show up here. This app is being built live by AI coding agents,
            one ticket at a time.
          </p>
        </section>
      </main>
    </div>
  );
}
