import { createClient } from '@/utils/supabase'
import { FormSubmission } from '@/types/form'
import { DashboardClient } from './dashboard-client'

export default async function Dashboard() {
  const supabase = await createClient()

  const { data: responses, error } = await supabase
    .from('form_responses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching responses:', error)
    return <div>Error loading dashboard</div>
  }

  return <DashboardClient initialSubmissions={responses as FormSubmission[]} />
}
