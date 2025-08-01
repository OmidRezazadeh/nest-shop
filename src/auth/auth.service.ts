import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/registerDto'; // Adjust the path if necessary
import { USER_STATUS } from 'src/common/constants/user-status';
import { ROLE_NAME } from 'src/common/constants/role-name';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from 'src/common/constants/custom-http.exceptions';
import { confirmationCode } from '../confirmation-code/entities/confirmationCode';
import { CreateUserDto } from 'src/user/dto/googleUser.dto';
import { LoginDto } from './dto/login.dto';
import { SavePasswordDto } from './dto/savePasswordDto';
import { GoogleLoginDto } from './dto/googleLoginDto';
@Injectable()
export class AuthService {
    constructor(

      @InjectRepository(confirmationCode)
      private readonly confirmationCodeRepository:Repository<confirmationCode>,
      
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      private readonly  userService:UserService,
      private readonly jwtService: JwtService,

      ) {}

      async validateJwtUser(userId){
        const user= await this.userService.findById(userId)
               if (!user) {
                 throw new UnauthorizedException('کاربری یافت نشد')
                  }
      }
      async validateGoogleUser(googleUser:CreateUserDto){
         const user = await this.userService.findByEmail(googleUser.email)
         if(!user){ 
          throw new UnauthorizedException('کاربری یافت نشد')
         }
          return await this.userService.create(googleUser)
         
      }


      async createUser(registerDto: RegisterDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);  
     
        const user = this.userRepository.create({
          ...registerDto,
          password: hashedPassword, 
          status: USER_STATUS.INACTIVE,
          role_id:ROLE_NAME.Clint
        });
        return this.userRepository.save(user);

      }
       
      async validateUser(email:string, password:string){
        const user =await this.userService.findByEmail(email);
        if(!user){
           throw new UnauthorizedException(' ایمیل وارد شده صحیح نیست ');

        }
        
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('رمز عبور وارد شده صحیح نیست ');
    }

    return user; 
      }
      async login(loginDto: LoginDto){
          const user = await this.validateUser(loginDto.email, loginDto.password);
         const token= this.generateJwtToken(user)
          const hashedRefreshToken = await bcrypt.hash((await token).refreshToken, 10);
          await this.userRepository.update(user.id, { refreshToken: hashedRefreshToken });
          return {
            access_token: (await token).accessToken,
            refresh_token:  (await token).refreshToken
          }   
       }
       async generateJwtToken(user){
        const payload = { email: user.email, id: user.id,role_id:user.role.id };
        const accessToken =this.jwtService.sign(payload,{expiresIn:'1h'})
        const refreshToken = this.jwtService.sign(payload, { expiresIn:'7d'});
        user.refreshToken = refreshToken;
        await this.userRepository.save(user);
        return {
          accessToken,refreshToken
        } 
      }
      async loginGoogle(user: GoogleLoginDto) {

        const { accessToken, refreshToken } = await this.generateJwtToken(user);
        return {
          id: user.id,
          accessToken,
          refreshToken,
        };
      }



      async logout(userId:number){
        await this.userRepository.update(userId, { refreshToken: null as any });
      }
      async refreshToken(userId: number, refreshToken: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
      
        if (!user) {
          throw new UnauthorizedException('کاربری یافت نشد');
        }
      
        // Check if the refresh token matches the stored token
        if (user.refreshToken !== refreshToken) {
          throw new UnauthorizedException('توکن وارد شد نامعتبر است');
        }
      
        try {
          // Verify if the refresh token is still valid
          this.jwtService.verify(refreshToken);
        } catch (error) {
          throw new UnauthorizedException('نشانه Refresh منقضی شده است. لطفا دوباره وارد شوید');
        }
      
        // Generate new tokens
        const payload = { email: user.email, id: user.id };
        const newAccessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
        const newRefreshToken = this.jwtService.sign(payload, { expiresIn:'7d'});
      
        // Update refresh token in database
        user.refreshToken = newRefreshToken;
        await this.userRepository.save(user);
      
        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };
      }

     async validateEmail(email:string){
      const user =await this.userService.findByEmail(email);
      if(!user){
         throw new UnauthorizedException(' ایمیل وارد شده صحیح نیست ');
      }
      }

     async validateSavePassword(savePasswordDto: SavePasswordDto){
          await this.validateEmail(savePasswordDto.email)
          
          const confirmationCode = await this.confirmationCodeRepository.findOne(
            {where:{ email:savePasswordDto.email, code:savePasswordDto.code}
          });
          if (!confirmationCode) {
             throw new NotFoundException(" کد وارد شده صحیح نیست")
          
            }

            const currentTime = new Date();
            const createdAt = new Date(confirmationCode.createdAt);
            const differenceInMinutes =
              (currentTime.getTime() - createdAt.getTime()) / (1000 * 60);
        
            if (differenceInMinutes > 2) {
              throw new BadRequestException(' این کد منقضی شده ');
            }



      }
      
    async updatePassword(email: string,password:string){
      const hashedPassword = await bcrypt.hash(password, 10);  
      await this.userRepository.update({ email }, { password: hashedPassword });
 
    }      
}
