import { trustBarCopy } from '../../data/copy';
import { ChefHat, ShieldCheck, FileCheck, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

const iconMap = {
  ChefHat,
  ShieldCheck,
  FileCheck,
  Globe,
};

export function TrustBar() {
  return (
    <section className="py-6 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {trustBarCopy.badges.map((badge, index) => {
            const Icon = iconMap[badge.icon as keyof typeof iconMap];
            return (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-2.5',
                  index < trustBarCopy.badges.length - 1 && 'lg:border-r lg:border-white/10 lg:pr-6'
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-[#2F8F4E]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#2F8F4E]" />
                </div>
                <p className="text-sm lg:text-base text-white/70 leading-tight">{badge.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
