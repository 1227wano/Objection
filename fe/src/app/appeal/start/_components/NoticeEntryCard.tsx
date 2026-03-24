import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface NoticeEntryCardProps {
  title: string;
  description: string;
  helperText: string;
  href: string;
  ctaLabel: string;
  icon: LucideIcon;
  variant?: 'upload' | 'manual';
}

export default function NoticeEntryCard({
  title,
  description,
  helperText,
  href,
  ctaLabel,
  icon: Icon,
  variant = 'upload',
}: NoticeEntryCardProps) {
  const isUpload = variant === 'upload';
  const descriptionClassName = isUpload
    ? 'mt-4 min-h-[64px] max-w-[520px] break-keep text-[16px] leading-8 text-slate-500'
    : 'mt-4 min-h-[48px] max-w-[460px] break-keep text-[16px] leading-8 text-slate-500';
  const topHelperTextClassName = 'mt-0 min-h-[24px] text-[14px] font-medium text-slate-400';
  const bottomHelperTextClassName = 'mt-4 min-h-[28px] text-sm font-medium text-first/70';
  const cardClassName = `group flex h-[460px] flex-col rounded-3xl border px-10 py-16 shadow-[0_10px_28px_rgba(15,15,112,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,15,112,0.10)] ${
    isUpload
      ? 'border-dashed border-first/25 bg-white'
      : 'border-first/12 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]'
  }`;

  return (
    <Link href={href} className={cardClassName}>
      <div className="flex h-full flex-1 flex-col items-center text-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-[20px] ${
            isUpload ? 'bg-first text-white' : 'bg-first/8 text-first'
          }`}
        >
          <Icon className="h-8 w-8" />
        </div>

        <h2 className="mt-5 min-h-[44px] text-[30px] font-extrabold tracking-[-0.04em] text-slate-900">
          {title}
        </h2>

        <p className={descriptionClassName}>{description}</p>

        {isUpload ? (
          <p className={topHelperTextClassName}>{helperText}</p>
        ) : (
          <div className={topHelperTextClassName} />
        )}

        <div className="mt-6 flex min-h-[48px] items-center justify-center">
          <div className="inline-flex items-center gap-2 text-base font-semibold text-first">
            <span>{ctaLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>

        {!isUpload ? <p className={bottomHelperTextClassName}>{helperText}</p> : null}
      </div>
    </Link>
  );
}
