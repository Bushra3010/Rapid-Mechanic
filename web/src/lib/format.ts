import type { JobStatus, OrderStatus, VehicleType } from '../types'

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
export const dateTime = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
export const date = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
export const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}`
export const vehicleLabel: Record<VehicleType | 'both', string> = { two_wheeler: 'Two-wheeler', four_wheeler: 'Four-wheeler', both: 'All vehicles' }

export const JOB_FLOW: JobStatus[] = ['submitted', 'assigned', 'in_progress', 'completed']
export const ORDER_FLOW: OrderStatus[] = ['placed', 'dispatched', 'in_transit', 'delivered']
export const jobLabel: Record<JobStatus, string> = { submitted: 'Request submitted', assigned: 'Job assigned', in_progress: 'Work in progress', completed: 'Job completed', cancelled: 'Cancelled' }
export const orderLabel: Record<OrderStatus, string> = { placed: 'Order placed', dispatched: 'Dispatched', in_transit: 'In transit', delivered: 'Delivered', cancelled: 'Cancelled' }
export const nextJob = (s: JobStatus): JobStatus | undefined => JOB_FLOW[JOB_FLOW.indexOf(s) + 1]
export const nextOrder = (s: OrderStatus): OrderStatus | undefined => ORDER_FLOW[ORDER_FLOW.indexOf(s) + 1]
