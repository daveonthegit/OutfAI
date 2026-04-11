/**
 * Light editorial surface for marketing/auth — bone base, structural grid, no radius drift.
 * Fixed decorative layer; keep pointer-events-none.
 */
export function EditorialBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#f4f3ef]" />

      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(10, 10, 10, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(10, 10, 10, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
        }}
      />

      <div className="absolute inset-y-0 left-[12%] w-px bg-gradient-to-b from-transparent via-[#0a0a0a]/[0.06] to-transparent md:left-[18%]" />

      <div className="absolute -right-[20%] top-[8%] h-[min(42rem,55vh)] w-[min(42rem,55vw)] bg-[radial-gradient(circle_at_center,rgba(255,77,0,0.07),transparent_68%)] blur-3xl" />

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='%230a0a0a'%3E%3Ccircle cx='10' cy='14' r='1'/%3E%3Ccircle cx='46' cy='28' r='1'/%3E%3Ccircle cx='92' cy='18' r='1'/%3E%3Ccircle cx='130' cy='48' r='1'/%3E%3Ccircle cx='32' cy='82' r='1'/%3E%3Ccircle cx='76' cy='70' r='1'/%3E%3Ccircle cx='118' cy='94' r='1'/%3E%3Ccircle cx='20' cy='126' r='1'/%3E%3Ccircle cx='68' cy='138' r='1'/%3E%3Ccircle cx='142' cy='132' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,transparent_0%,rgba(244,243,239,0.92)_62%,#f4f3ef_100%)]" />
    </div>
  );
}
