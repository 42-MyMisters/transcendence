import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class DirectMesage extends BaseEntity {
    @PrimaryGeneratedColumn()
    did: number;

    @Column()
    senderId: number;

    @Column()
    recieverId: number;

    @Column({nullable: true, type: 'varchar'})
    message: string | null;

    @CreateDateColumn()
	createdAt: Date;
    
}