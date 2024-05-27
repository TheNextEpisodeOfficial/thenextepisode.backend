import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { OrdItemService } from "./ordItem.service";

/**
 * OrdItemController : 주문상품 API를 관리한다
 */
@Controller("/ordPayment")
@ApiTags("OrdPayment")
export class OrdItemController {
  constructor(private readonly ordItemService: OrdItemService) {}
}
