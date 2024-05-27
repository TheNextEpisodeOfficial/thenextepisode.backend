import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { InsertResult } from "typeorm";
import { OrdPaymentEntity } from "./entities/ordPayment.entity";
import { OrdPaymentService } from "./ordPayment.service";

/**
 * OrdPaymentController : 주문결제 API를 관리한다
 */
@Controller("/ordPayment")
@ApiTags("OrdPayment")
export class OrdPaymentController {
  constructor(private readonly ordPaymentService: OrdPaymentService) {}

  /**
   * S : createOrdPayment
   */
  @Get("/createOrdPayment")
  @ApiOperation({
    summary: "결제 데이터를 생성",
    description:
      "결제 데이터를 생성한다. <결제, 티켓> 테이블에 데이터를 생성한다.",
  })
  @ApiCreatedResponse({
    description:
      "결제 데이터를 생성한다. <결제, 티켓> 테이블에 데이터를 생성한다.",
    type: OrdPaymentEntity,
  })
  async createOrd(ordPayment: OrdPaymentEntity): Promise<InsertResult> {
    try {
      const ordInsertResult = await this.ordPaymentService.createPayment(
        ordPayment
      );
      return ordInsertResult;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  /**
   * E : createOrd
   */
}
