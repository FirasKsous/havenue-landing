/**
 * Lead magnet registry. Maps magnet IDs to their metadata and download URLs.
 * Files are stored in Supabase Storage (public bucket: lead-magnets).
 */

interface LeadMagnet {
  title: string
  downloadUrl: string
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''

const LEAD_MAGNETS: Record<string, LeadMagnet> = {
  hospitality_profit_calculator: {
    title: 'The 2026 Hospitality Profit Calculator',
    downloadUrl: `${SUPABASE_URL}/storage/v1/object/public/lead-magnets/hospitality-profit-calculator.xlsx`,
  },
}

export function getLeadMagnetDownloadUrl(magnetId: string): string | null {
  return LEAD_MAGNETS[magnetId]?.downloadUrl ?? null
}

export function getLeadMagnetTitle(magnetId: string): string | null {
  return LEAD_MAGNETS[magnetId]?.title ?? null
}
