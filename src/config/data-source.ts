import { DataSource } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'your_db_user',
  password: 'your_db_password',
  database: 'your_db_name',
  entities: [User, Role],
  migrations: ['src/database/migrations/*.ts'], 
  synchronize: false, 
  logging: true,
});
