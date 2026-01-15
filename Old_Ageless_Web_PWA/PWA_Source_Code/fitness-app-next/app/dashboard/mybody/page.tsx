'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function MyBodyPage() {
  return (
    <div className="space-y-6">
      <div className="text-center bg-surface p-6 rounded-xl shadow-elev">
        <h2 className="text-2xl font-bold mb-2">My Body</h2>
        <p className="text-text-muted">Track your body metrics and measurements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Body Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-muted">Coming soon: Track weight, body fat, measurements, and progress photos.</p>
        </CardContent>
      </Card>
    </div>
  )
}
