/**
 * Dark ink surface — subtle grid, warm lift, no pointer events.
 */
export function ShowcaseBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Ferrari-inspired void black */}
      <div className="absolute inset-0 bg-[var(--marketing-void)]" />

      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(244, 243, 239, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(244, 243, 239, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="absolute inset-y-0 left-[10%] w-px bg-gradient-to-b from-transparent via-[#f4f3ef]/[0.07] to-transparent md:left-[16%]" />

      <div className="absolute -right-[18%] top-[6%] h-[min(38rem,52vh)] w-[min(38rem,52vw)] bg-[radial-gradient(circle_at_center,rgba(198,165,100,0.09),transparent_65%)] blur-3xl" />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='%23f4f3ef'%3E%3Ccircle cx='10' cy='14' r='0.9'/%3E%3Ccircle cx='92' cy='18' r='0.9'/%3E%3Ccircle cx='130' cy='48' r='0.9'/%3E%3Ccircle cx='76' cy='70' r='0.9'/%3E%3Ccircle cx='118' cy='94' r='0.9'/%3E%3Ccircle cx='68' cy='138' r='0.9'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(244,243,239,0.06)_0%,transparent_50%)]" />
    </div>
  );
}
