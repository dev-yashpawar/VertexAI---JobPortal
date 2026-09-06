export default function BrandLogo({
  className = '',
  logoClassName = 'h-9 w-auto',
  nameClassName = 'font-bold text-xl text-primary tracking-tight',
  subtitle = '',
  subtitleClassName = 'text-[10px] text-accent font-bold uppercase tracking-[0.2em]',
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <img
        src="/vertexjob-logo.png"
        alt="VertexJob logo"
        className={`${logoClassName} object-contain`}
      />
      <div className="flex flex-col">
        <span className={nameClassName}>VertexJob</span>
        {subtitle ? <span className={subtitleClassName}>{subtitle}</span> : null}
      </div>
    </div>
  );
}
