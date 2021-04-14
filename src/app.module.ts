import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { TransactionModule } from './transaction/transaction.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';

const ApplicationModule = [
  UserModule,
  ProductModule,
  TransactionModule,
  CartModule,
  WishlistModule,
];

const VendorModule = [
  TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'flower',
    entities: [User],
    synchronize: true,
  }),
];

@Module({
  imports: [...ApplicationModule, ...VendorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
