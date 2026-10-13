type LogoItem = {
  id: string;
  label: string;
  /** Full public path including extension, e.g. `/logos/acibadem.svg` */
  src: string;
  /** Taller mark (circular seals) */
  tall?: boolean;
};

type Props = {
  ariaLabel: string;
  logos: readonly LogoItem[];
};

export default function LogoCarousel({ ariaLabel, logos }: Props) {
  // Four copies so the strip stays dense on wide viewports.
  const loop = [...logos, ...logos, ...logos, ...logos];

  return (
    <section id="institutions" className="bg-white pb-8 pt-11 sm:pb-10 sm:pt-12" aria-label={ariaLabel}>
      <ul className="sr-only">
        {logos.map((logo) => (
          <li key={logo.id}>{logo.label}</li>
        ))}
      </ul>

      <div className="logo-marquee relative overflow-hidden" aria-hidden="true">
        <div className="logo-marquee-fade pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-20" />
        <div className="logo-marquee-fade pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-20" />

        <div className="logo-marquee-track flex w-max items-center gap-10 py-1 sm:gap-12 md:gap-14">
          {loop.map((logo, index) => (
            <img
              key={`${logo.id}-${index}`}
              src={logo.src}
              alt=""
              className={`w-auto max-w-[150px] shrink-0 select-none object-contain opacity-50 grayscale ${
                logo.tall
                  ? "h-11 sm:h-12 md:h-14"
                  : "h-9 sm:h-10 md:h-12"
              }`}
              draggable={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
