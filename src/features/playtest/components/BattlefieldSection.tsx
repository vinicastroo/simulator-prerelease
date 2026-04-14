type BattlefieldSectionProps = {
  topLabel: string;
  bottomLabel: string;
};

export function BattlefieldSectionDividers({
  topLabel,
  bottomLabel,
}: BattlefieldSectionProps) {
  return (
    <>
      {/* Horizontal divider lines */}
      <div className="pointer-events-none absolute inset-x-8 top-[82px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-8 bottom-[96px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Section labels */}
      <div className="pointer-events-none absolute left-8 top-[58px] font-mono text-[10px] uppercase tracking-[0.2em] text-white/16">
        {topLabel}
      </div>
      <div className="pointer-events-none absolute left-8 bottom-[70px] font-mono text-[10px] uppercase tracking-[0.2em] text-white/16">
        {bottomLabel}
      </div>
    </>
  );
}
