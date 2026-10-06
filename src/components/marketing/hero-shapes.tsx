import { cn } from "@/lib/utils";

// Marketing hero artwork: flat geometric shapes in the shape-* colours only
// (no outline, shadow or gradient). Five shapes on desktop, three on phones,
// kept above and to the right of the copy so body text never sits on them.

function Ring({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        d="M50 0a50 50 0 1 1 0 100A50 50 0 0 1 50 0Zm0 24a26 26 0 1 0 0 52 26 26 0 0 0 0-52Z"
      />
    </svg>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <path d="M50 0C55 37 63 45 100 50 63 55 55 63 50 100 45 63 37 55 0 50 37 45 45 37 50 0Z" />
    </svg>
  );
}

function Octagon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <path d="M29.3 0h41.4L100 29.3v41.4L70.7 100H29.3L0 70.7V29.3Z" />
    </svg>
  );
}

function Triangle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 87" aria-hidden="true" className={className}>
      <path d="M50 0 100 87H0Z" />
    </svg>
  );
}

function Slant({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 50" aria-hidden="true" className={className}>
      <path d="M28 0h72L72 50H0Z" />
    </svg>
  );
}

export function HeroShapes({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <Ring className="absolute -top-24 -right-20 w-72 fill-shape-lavender md:-top-40 md:-right-24 md:w-[34rem]" />
      <Triangle className="absolute top-6 right-[52%] hidden w-40 -rotate-12 fill-shape-tan md:block lg:right-[44%] lg:w-48" />
      <Star className="absolute top-36 right-40 w-36 rotate-12 fill-shape-mint md:top-[38%] md:right-[30%] md:w-64" />
      <Octagon className="absolute top-8 left-6 w-20 rotate-[22deg] fill-shape-coral md:top-auto md:right-16 md:bottom-28 md:left-auto md:w-56" />
      <Slant className="absolute -right-10 -bottom-6 hidden w-80 -rotate-6 fill-shape-green md:block" />
    </div>
  );
}
