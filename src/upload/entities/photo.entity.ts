import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'photo' })
export class Photo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    filename: string;

    @Column({ type: 'int', nullable: false })
    @Index()
    imageable_id: number; 

    @Column({ type: 'varchar', length: 50, nullable: false })
    @Index()
    imageable_type: string;

    @CreateDateColumn()
    created_at: Date;
}
