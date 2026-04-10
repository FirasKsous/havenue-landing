import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const results = { sqlAlerts: 0, staleTrials: 0 }

  try {
    const { data: alertedIds } = await supabase
      .from('contact_activities')
      .select('contact_id')
      .eq('activity_type', 'sql_alert_sent')

    const alertedSet = new Set(
      (alertedIds || []).map((a: { contact_id: string }) => a.contact_id)
    )

    const { data: allSqlLeads } = await supabase
      .from('contacts')
      .select('id, email, lead_score, capture_source, company_name')
      .eq('lead_tier', 'sales_qualified')
      .not('email', 'is', null)

    const unalertedLeads = (allSqlLeads || []).filter(
      (l) => !alertedSet.has(l.id)
    )

    for (const lead of unalertedLeads) {
      const webhookUrl = Deno.env.get('MAKE_WEBHOOK_HIGH_SCORE_LEAD')
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_sql_lead',
            email: lead.email,
            score: lead.lead_score,
            source: lead.capture_source,
            company: lead.company_name,
          }),
        })
      }

      await supabase.from('contact_activities').insert({
        contact_id: lead.id,
        activity_type: 'sql_alert_sent',
        title: `SQL alert sent to Slack (score: ${lead.lead_score})`,
        data: { score: lead.lead_score },
      })

      results.sqlAlerts++
    }

    const { data: staleTrials } = await supabase
      .from('contacts')
      .select('id, email, trial_ends_at')
      .eq('subscription_status', 'trialing')
      .lt('trial_ends_at', new Date().toISOString())

    results.staleTrials = staleTrials?.length ?? 0

    if (results.staleTrials > 0) {
      console.warn(
        `[sweeper] Found ${results.staleTrials} stale trials (expired but not converted)`
      )
    }

    console.log(
      `[sweeper] Complete: ${results.sqlAlerts} SQL alerts, ${results.staleTrials} stale trials`
    )

    return new Response(JSON.stringify(results), { status: 200 })
  } catch (err) {
    console.error('[sweeper] Error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
