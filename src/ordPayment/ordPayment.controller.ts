import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post, Req, UseGuards,
} from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { InsertResult } from "typeorm";
import { OrdPaymentEntity } from "./entities/ordPayment.entity";
import { OrdPaymentService } from "./ordPayment.service";
import {JwtAuthGuard} from "@src/auth/jwtAuth.guard";

/**
 * OrdPaymentController : 주문결제 API를 관리한다
 */
@Controller("/ordPayment")
@ApiTags("Order Payment")
export class OrdPaymentController {
  constructor(private readonly ordPaymentService: OrdPaymentService) {}

  /**
   * S : createOrdPayment
   */
  @Post("/createOrdPayment")
  @UseGuards(JwtAuthGuard)
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
  async createOrd(
      @Req() req,
      @Body() ordPayment: OrdPaymentEntity
  ): Promise<InsertResult> {
    try {
      ordPayment.createdBy = req.user.id;
      const ordInsertResult = await this.ordPaymentService.createOrdPayment(
        ordPayment
      );
      if (ordInsertResult) {
        return ordInsertResult;
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  /**
   * E : createOrd
   */
}
