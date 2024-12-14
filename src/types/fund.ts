export interface Fund {
  id: string
  ticker: string
  name: string
  currentPrice: number
  lastDividend: number
  updatedAt: Date
  createdAt: Date
}
