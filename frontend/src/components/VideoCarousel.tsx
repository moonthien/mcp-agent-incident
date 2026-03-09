import type { VideoItem } from '../lib/types'
import { cn } from './ui/cn'

type VideoCarouselProps = {
  videos: VideoItem[]
  selectedId: string | null
  onSelect: (video: VideoItem) => void
}

export function VideoCarousel({ videos, selectedId, onSelect }: VideoCarouselProps) {
  if (!videos.length) return null

  return (
    <div className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 px-3 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.9)] backdrop-blur-lg">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300/80">Video</div>
        <div className="text-[11px] text-slate-400">Hover để xem trước • Click để mở player</div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 pt-1">
        {videos.map((v) => {
          const isActive = v.id === selectedId
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v)}
              className={cn(
                'group relative flex w-[220px] shrink-0 flex-col rounded-xl border bg-slate-900/60 text-left transition-all',
                'border-slate-700/80 hover:border-sky-400 hover:bg-slate-900 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(8,47,73,0.9)]',
                isActive &&
                  'border-sky-500 shadow-[0_0_0_1px_rgba(56,189,248,0.9),0_18px_45px_rgba(8,47,73,0.95)]',
              )}
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-slate-800">
                {v.thumbnail ? (
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500">
                    No thumbnail
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white shadow-lg">
                    ▶
                  </div>
                </div>
                <div className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-100">
                  Xem trước (muted)
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1 rounded-b-xl bg-gradient-to-br from-slate-950/90 to-slate-900/90 px-2.5 py-2.5">
                <div className="line-clamp-2 text-[13px] font-medium text-slate-50">{v.title}</div>
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span className="truncate">{v.source}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

