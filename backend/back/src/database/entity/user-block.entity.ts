import { BaseEntity, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserBlock extends BaseEntity {
  @PrimaryColumn()
  fromUserId: number;

  @PrimaryColumn()
  targetToBlockId: number;
  
  @ManyToOne(type => User, targetToBlock => targetToBlock.blockedUsers, { onDelete: 'CASCADE', onUpdate: 'CASCADE', lazy:true })
  @JoinColumn({ name: 'targetToBlockId' })
  targetToBlock: User;

  @CreateDateColumn()
  createdAt: Date;
}