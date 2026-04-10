
import { footerCopy } from '../../data/copy';
import { GlassButton } from '../ui/GlassButton';

export function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/10">
      {/* CTA Section */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 lg:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {footerCopy.cta.headline}
          </h2>
          <GlassButton href="#pricing" variant="primary" className="mt-6">
            {footerCopy.cta.buttonText}
          </GlassButton>
          <p className="mt-3 text-sm text-white/50">{footerCopy.cta.microcopy}</p>
        </div>
      </div>

      {/* Links Section */}
      <div className="border-t border-white/10">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#2F8F4E] flex items-center justify-center">
                  <span className="text-[#0A0A0A] font-bold text-sm">H</span>
                </div>
                <span className="text-white font-semibold">Havenue</span>
              </div>
              <p className="text-sm text-white/50">{footerCopy.tagline}</p>
            </div>

            {/* Link Columns */}
            {footerCopy.columns.map((column) => (
              <div key={column.title}>
                <h4 className="text-sm font-semibold text-white mb-4">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
          <p className="text-sm text-white/50 text-center">{footerCopy.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
