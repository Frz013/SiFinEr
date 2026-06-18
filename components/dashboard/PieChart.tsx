'use client'

import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PieChartData {
  name: string
  value: number
  color: string
}

interface PieChartProps {
  data: PieChartData[]
  onSliceClick?: (name: string) => void
}

export default function PieChartView({ data, onSliceClick }: PieChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-4 h-[300px] flex items-center justify-center">
        <p className="text-sm text-nb-text-secondary">Belum ada data</p>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-4">
      <ResponsiveContainer width="100%" height={300}>
        <RePieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius="80%"
            stroke="#000"
            strokeWidth={2}
            dataKey="value"
            label={false}
            onClick={(entry) => onSliceClick?.(entry.name)}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
                style={{ cursor: onSliceClick ? 'pointer' : 'default' }}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#000',
              border: 'none',
              borderRadius: 0,
              color: '#fff',
              fontSize: 12,
              padding: '8px 12px',
            }}
            formatter={(value: number, name: string) => [
              `Rp ${value.toLocaleString('id-ID')}`,
              name,
            ]}
            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value: string) => (
              <span className="text-black font-medium">{value}</span>
            )}
          />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  )
}
