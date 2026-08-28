
export function PopularBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2.5 py-1 text-[0.58rem] uppercase tracking-wider2 text-accent">
      <span className="h-1 w-1 rounded-full bg-accent" />
      Favourite
    </span>
  );
}

export function FeaturedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 px-2.5 py-1 text-[0.58rem] uppercase tracking-wider2 text-gold">
      ✦ Featured
    </span>
  );
}
