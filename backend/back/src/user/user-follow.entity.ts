import { BaseEntity, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserFollow extends BaseEntity {
  @PrimaryColumn()
  followerId: number;

  @PrimaryColumn()
  followingId: number;

  @ManyToOne(type => User, follower => follower.followers, { onDelete: 'CASCADE', onUpdate: 'CASCADE', eager:true })
  @JoinColumn({ name: 'followerId' })
  follower: User;
  
  @ManyToOne(type => User, following => following.followings, { onDelete: 'CASCADE', onUpdate: 'CASCADE', eager:true })
  @JoinColumn({ name: 'followingId' })
  following: User;

  @CreateDateColumn()
  createdAt: Date;
}