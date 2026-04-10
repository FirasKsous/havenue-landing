export function MessyPDFBefore() {
  return (
    <div
      className="rounded-xl overflow-hidden border border-red-500/20 bg-[#f5f0e8] p-3 lg:p-4 relative"
      style={{
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        transform: 'rotate(-1.5deg)',
      }}
    >
      {/* Coffee stain watermark */}
      <div
        className="absolute top-3 right-2 w-10 h-10 rounded-full opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #8B4513 0%, transparent 70%)',
        }}
      />

      {/* PDF Header — messy restaurant logo */}
      <div className="flex items-center gap-1.5 mb-2 border-b border-[#ccc] pb-1.5">
        <div className="w-5 h-5 rounded bg-[#c0392b]/60 flex items-center justify-center">
          <span className="text-white text-[7px] font-bold">PDF</span>
        </div>
        <div>
          <div className="text-[7px] font-bold text-[#333] leading-tight" style={{ fontFamily: 'serif' }}>
            The Grand Oak Bistro
          </div>
          <div className="text-[5px] text-[#888]">Spring Menu 2026</div>
        </div>
      </div>

      {/* Messy content lines — mimicking a badly formatted PDF menu */}
      <div className="space-y-1.5">
        {/* Category header */}
        <div className="text-[6px] font-bold text-[#333] uppercase tracking-wider border-b border-dashed border-[#aaa] pb-0.5">
          Starters
        </div>

        {/* Menu items — misaligned, inconsistent formatting */}
        <div className="flex justify-between items-baseline">
          <span className="text-[5.5px] text-[#444]" style={{ fontFamily: 'serif' }}>Soup of the Day</span>
          <span className="text-[5px] text-[#666]">....... £6.50</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[5.5px] text-[#444]" style={{ fontFamily: 'serif' }}>Prawn Cocktail (GF*)</span>
          <span className="text-[5px] text-[#666]">.. £8.95</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[5.5px] text-[#444]" style={{ fontFamily: 'serif' }}>Bread Basket (V)</span>
          <span className="text-[5px] text-[#666]">.... £4.50</span>
        </div>

        {/* Another category */}
        <div className="text-[6px] font-bold text-[#333] uppercase tracking-wider border-b border-dashed border-[#aaa] pb-0.5 mt-1">
          Mains
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[5.5px] text-[#444]" style={{ fontFamily: 'serif' }}>Beef Wellington</span>
          <span className="text-[5px] text-[#666]">... £24.95</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[5.5px] text-[#444]" style={{ fontFamily: 'serif' }}>Pan-Seared Salmon</span>
          <span className="text-[5px] text-[#666]">. £18.50</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[5.5px] text-[#444]" style={{ fontFamily: 'serif' }}>Mushroom Risotto (V)</span>
          <span className="text-[5px] text-[#666]"> £14.00</span>
        </div>

        {/* Smudged/crossed out price */}
        <div className="flex justify-between items-baseline">
          <span className="text-[5.5px] text-[#444]" style={{ fontFamily: 'serif' }}>Lamb Shank</span>
          <span className="text-[5px] text-[#666] line-through decoration-red-600/60">£19.95</span>
        </div>

        {/* Handwritten annotation */}
        <div
          className="text-[5px] text-red-600/70 -rotate-2 mt-0.5"
          style={{ fontFamily: 'cursive' }}
        >
          * check allergens!!
        </div>
      </div>

      {/* Faded footer */}
      <div className="mt-2 pt-1 border-t border-[#ddd]">
        <div className="text-[4px] text-[#aaa] text-center">
          Prices subject to change | VAT included | Allergen info available on request
        </div>
      </div>

      {/* Scan artifact overlay — slight noise */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 3px)',
        }}
      />
    </div>
  );
}
