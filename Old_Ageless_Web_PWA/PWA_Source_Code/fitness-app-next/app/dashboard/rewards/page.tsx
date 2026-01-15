'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function RewardsPage() {
  return (
    <div className="space-y-6">
      <div className="text-center bg-surface p-6 rounded-xl shadow-elev">
        <h2 className="text-2xl font-bold mb-2">Rewards</h2>
        <p className="text-text-muted">Track your points and achievements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-muted">Coming soon: Earn points for completing workouts and unlock achievements.</p>
        </CardContent>
      </Card>
    </div>
  )
}
