import { cn } from '../../lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  body?: string;
  bullets?: string[];
  className?: string;
  align?: 'center' | 'left';
  headingLevel?: 'h2' | 'h3';
}

export function SectionHeading({
  eyebrow,
  headline,
  subheadline,
  body,
  bullets,
  className,
  align = 'center',
  headingLevel = 'h2',
}: SectionHeadingProps) {
  const isCenter = align === 'center';
  const Heading = headingLevel;

  return (
    <div className={cn(
      isCenter && 'text-center max-w-4xl mx-auto',
      className
    )}>
      {eyebrow && (
        <span
          className="inline-block font-bold tracking-widest uppercase text-[#2F8F4E] mb-4"
          style={{ fontSize: 'var(--font-size-eyebrow)' }}
        >
          {eyebrow}
        </span>
      )}
      <Heading
        className="font-bold text-white mb-4"
        style={{ fontSize: headingLevel === 'h2' ? 'var(--font-size-h2)' : 'var(--font-size-h3)' }}
      >
        {headline}
      </Heading>
      {subheadline && (
        <p
          className={cn('text-white/70 mb-6', isCenter && 'max-w-2xl mx-auto')}
          style={{ fontSize: 'var(--font-size-body)' }}
        >
          {subheadline}
        </p>
      )}
      {body && (
        <p
          className={cn('text-white/60 leading-relaxed', isCenter && 'max-w-2xl mx-auto')}
          style={{ fontSize: 'var(--font-size-body-sm)' }}
        >
          {body}
        </p>
      )}
      {bullets && bullets.length > 0 && (
        <ul className={cn('mt-6 space-y-3 text-left', isCenter && 'max-w-xl mx-auto')}>
          {bullets.map((bullet, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-white/70"
              style={{ fontSize: 'var(--font-size-body-sm)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F8F4E] mt-2 flex-shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
