export interface DashboardSummaryDto {
  totalOrders: number;
  completedOrders: number;
  failedOrders: number;
  pendingOrders: number;
  processingOrders: number;
  lowStockMaterials: number;
}
