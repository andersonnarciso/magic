export interface Fund {
  id: string
  ticker: string
  name: string
  currentPrice: number | null
  lastDividend: number | null
  lastDividendDate: Date | null
  updatedAt: Date
  createdAt: Date
}
