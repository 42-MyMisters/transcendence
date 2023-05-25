import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserFollow extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fromUserId: number;

  @Column()
  targetToFollowId: number;

  @ManyToOne(type => User, fromUser => fromUser.followers)
  @JoinColumn({ name: 'fromUserId', referencedColumnName: 'uid' })
  fromUser: User;
  
  @ManyToOne(type => User, targetToFollow => targetToFollow.followings)
  @JoinColumn({ name: 'targetToFollowId', referencedColumnName: 'uid' })
  targetToFollow: User;

  @CreateDateColumn()
  createdAt: Date;
}