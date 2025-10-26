import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function OverviewPage() {
  // Redirect to issues page for now
  redirect('/dashboard/DEV/issues')
}
