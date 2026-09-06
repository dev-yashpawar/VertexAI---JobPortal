import { Card } from "./card"

export function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <Card className="flex flex-col gap-2 p-6">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-secondary">{title}</h3>
        {Icon && <Icon className="w-5 h-5 text-accent opacity-80" />}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-primary tracking-tight">{value}</p>
        {trend && (
           <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span>
        )}
      </div>
    </Card>
  )
}
