import { BaseEntity, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserFollower extends BaseEntity {
  @PrimaryColumn()
  followerId: number;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(type => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE', eager:true })
  @JoinColumn({ name: 'followerId' })
  follower: User;
  
  @ManyToOne(type => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE', eager:true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}