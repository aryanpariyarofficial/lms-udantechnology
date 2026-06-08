/** Full-bleed muted, looping YouTube background for the hero section. */
export function HeroVideo({ videoId }: { videoId: string }) {
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3`

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-900">
      <iframe
        src={src}
        title="Background video"
        aria-hidden
        tabIndex={-1}
        allow="autoplay; encrypted-media"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
      />
      {/* Readability overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950/85" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_30%,rgba(86,80,239,0.25),transparent)]" />
    </div>
  )
}
