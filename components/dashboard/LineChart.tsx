'use client'

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface LineChartData {
  date: string
  income: number
  expense: number
}

interface LineChartProps {
  data: LineChartData[]
}

export default function LineChartView({ data }: LineChartProps) {
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
        <ReLineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: '#000',
              border: 'none',
              borderRadius: 0,
              color: '#fff',
              fontSize: 12,
            }}
            formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, '']}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value: string) => (
              <span className="text-black font-medium">{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#16A34A"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#000', stroke: '#000' }}
            activeDot={{ r: 6 }}
            name="Pemasukan"
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#DC2626"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#000', stroke: '#000' }}
            activeDot={{ r: 6 }}
            name="Pengeluaran"
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  )
}
