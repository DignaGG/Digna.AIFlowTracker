import type { IStep } from '../Interfaces/IStep'

interface ArchivedSidebarProps {
  steps: IStep[]
  onDeleteRequest: (id: string) => void
}

export function ArchivedSidebar({ steps, onDeleteRequest }: ArchivedSidebarProps) {
  return (
    <aside className="hidden w-72 flex-none flex-col h-full min-h-0 border-r border-gray-200 bg-gray-50 md:flex dark:border-slate-700 dark:bg-slate-900">
      <div className="flex-none border-b border-gray-200 p-4 dark:border-slate-700">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
          Geçmiş Kayıtlar
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 p-4 min-h-0">
        {steps.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500">Henüz tamamlanmış kayıt yok.</p>
        ) : (
          steps.map((s) => (
            <div
              key={s.id}
              className="group relative rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <button
                onClick={() => onDeleteRequest(s.id)}
                className="absolute right-2 top-2 cursor-pointer rounded p-1 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:text-slate-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                aria-label="Sil"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                <span className="rounded bg-green-100 px-1.5 py-0.5 font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                  P{s.phase}.S{s.step}
                </span>
              </div>
              <p className="line-clamp-2 text-sm text-gray-700 dark:text-slate-300">
                {s.gptPrompt}
              </p>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
