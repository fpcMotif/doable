import { redirect } from 'next/navigation'

export default function OverviewPage() {
  // Redirect to issues page for now
  redirect('/dashboard/DEV/issues')
}
