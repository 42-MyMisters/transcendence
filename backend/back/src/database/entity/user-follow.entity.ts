import { BaseEntity, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserFollow extends BaseEntity {
  @PrimaryColumn()
  fromUserId: number;

  @PrimaryColumn()
  targetToFollowId: number;

  @ManyToOne(type => User, fromUser => fromUser.followers, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'fromUserId' })
  fromUser: User;
  
  @ManyToOne(type => User, targetToFollow => targetToFollow.followings, { onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  @JoinColumn({ name: 'targetToFollowId' })
  targetToFollow: User;

  @CreateDateColumn()
  createdAt: Date;
}