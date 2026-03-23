import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StageCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  ctaLabel: string;
  emphasized?: boolean;
  requiredDocuments?: string[];
}

export default function StageCard({
  title,
  description,
  icon: Icon,
  href,
  ctaLabel,
  emphasized = false,
  requiredDocuments = [],
}: StageCardProps) {
  if (!emphasized && requiredDocuments.length > 0) {
    return (
      <div className="group h-full [perspective:1400px]">
        <div className="grid h-[380px] transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
          <div className="col-start-1 row-start-1 [backface-visibility:hidden]">
            <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/92 p-8 shadow-[0_14px_32px_rgba(15,15,112,0.08)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-first text-white">
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-[30px] font-extrabold leading-tight tracking-[-0.04em] text-slate-900">
                {title}
              </h3>

              <p className="mt-3 min-h-[56px] break-keep text-[15px] leading-7 text-slate-500">
                {description}
              </p>

              <div className="mt-auto pt-4">
                <Button asChild variant="outline" className="w-full justify-between rounded-2xl">
                  <Link href={href}>
                    <span>{ctaLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="col-start-1 row-start-1 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#16135f] bg-first p-8 text-white shadow-[0_14px_32px_rgba(15,15,112,0.14)]">
              <h3 className="text-[24px] font-extrabold leading-tight tracking-[-0.04em] text-white">
                {title}
              </h3>

              <div className="mt-8">
                <p className="text-[18px] font-bold text-white/90">필요 서류 목록</p>
                <div className="mt-3 h-px w-full bg-white/35" />
              </div>

              <ul className="mt-5 space-y-3 text-[18px] leading-7 text-white/92">
                {requiredDocuments.map((document) => (
                  <li key={document} className="flex gap-3">
                    <span className="mt-[10px] h-2.5 w-2.5 shrink-0 rounded-full bg-white/85" />
                    <span className="break-keep">{document}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-5">
                <Button
                  asChild
                  className="w-full justify-between rounded-2xl bg-white text-first hover:bg-white/90"
                >
                  <Link href={href}>
                    <span>{ctaLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-[380px] flex-col rounded-[28px] border p-8 transition-all duration-200 ${
        emphasized
          ? 'border-first/18 bg-white shadow-[0_18px_40px_rgba(15,15,112,0.10)]'
          : 'border-slate-200/80 bg-white/92 shadow-[0_14px_32px_rgba(15,15,112,0.08)]'
      }`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-first text-white">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-[30px] font-extrabold leading-tight tracking-[-0.04em] text-slate-900">
        {title}
      </h3>

      <p className="mt-3 min-h-[56px] break-keep text-[15px] leading-7 text-slate-500">
        {description}
      </p>

      <div className="mt-auto pt-4">
        <Button
          asChild
          variant={emphasized ? 'default' : 'outline'}
          className="w-full justify-between rounded-2xl"
        >
          <Link href={href}>
            <span>{ctaLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
