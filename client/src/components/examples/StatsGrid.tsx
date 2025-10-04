import StatsGrid from '../StatsGrid'
import { TrendingUp, Target, Flame } from "lucide-react"

export default function StatsGridExample() {
  const stats = [
    { label: 'Weight', value: '70kg', icon: TrendingUp, color: 'text-chart-1' },
    { label: 'Goal', value: '120g', icon: Target, color: 'text-chart-2' },
    { label: 'Streak', value: '7d', icon: Flame, color: 'text-warning' },
  ]

  return <StatsGrid stats={stats} />
}
