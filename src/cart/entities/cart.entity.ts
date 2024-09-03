import { Entity } from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("cart")
export class CartEntity extends CommonEntity {}
