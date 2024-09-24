import {
  Entity,
} from "typeorm";
import { CommonEntity } from "../../config/entities/common.entity";

@Entity("ord_timer")
export class OrdTimerEntity extends CommonEntity {}
