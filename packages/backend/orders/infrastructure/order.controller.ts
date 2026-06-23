import { Controller, Get, Post, Param, Query, Body, HttpCode, HttpStatus, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { OrderService } from '../application/order.service';
import {
  OrderDetailResponseDto,
  PaginatedOrdersDto,
  OrderFilterDto,
  DashboardSummaryDto,
  LowStockMaterialDto,
} from './dto/order-response.dto';
import { ShopifyWebhookDto } from './dto/webhook.dto';
import { ShopifyWebhookGuard } from './shopify-webhook.guard';
import { InventoryService } from '@test_2/backend-inventory';

@ApiTags('Orders')
@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Post('webhooks/order')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ShopifyWebhookGuard)
  @ApiExcludeEndpoint()
  async handleWebhook(@Body() body: ShopifyWebhookDto) {
    const storeName = body.name || 'shopify-store';
    return this.orderService.processWebhook(body as any, storeName);
  }

  @Get('orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar órdenes con filtros' })
  @ApiResponse({ status: 200, type: PaginatedOrdersDto })
  async findAll(@Query() filter: OrderFilterDto) {
    return this.orderService.findAll({
      status: filter.status,
      page: filter.page || 1,
      limit: filter.limit || 20,
      sortBy: filter.sortBy || 'createdAt',
      sortOrder: filter.sortOrder || 'desc',
      search: filter.search,
    });
  }

  @Get('orders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener detalle de una orden' })
  @ApiResponse({ status: 200, type: OrderDetailResponseDto })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async findById(@Param('id') id: string) {
    const order = await this.orderService.findById(id);
    if (!order) {
      return { statusCode: 404, message: 'Orden no encontrada' };
    }
    return order;
  }

  @Get('inventory')
  @UseInterceptors(CacheInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener inventario actual de materiales' })
  @ApiResponse({ status: 200 })
  async getInventory() {
    return this.inventoryService.getAll();
  }

  @Get('dashboard/summary')
  @UseInterceptors(CacheInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener resumen del dashboard' })
  @ApiResponse({ status: 200, type: DashboardSummaryDto })
  async getSummary() {
    const summary = await this.orderService.getSummary();
    const lowStock = await this.inventoryService.getLowStock(10);
    return { ...summary, lowStockMaterials: lowStock.length };
  }

  @Get('legacy/low-stock')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Materiales con bajo stock (compatibilidad legacy)' })
  @ApiResponse({ status: 200, type: [LowStockMaterialDto] })
  async getLowStock() {
    return this.inventoryService.getLowStock(10);
  }
}
