import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, StrategyOptions } from "passport-google-oauth20";
import googleOauthConfig from "src/config/google-oauth.config";
import { VerifiedCallback } from "passport-jwt";
import { AuthService } from '../auth/auth.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY) private googleConfiguration:
    ConfigType<typeof googleOauthConfig>,
    private authService: AuthService
     
  ) {
    super({
      clientID:googleConfiguration.clientID! ,
      clientSecret:googleConfiguration.clientSecret! ,
      callbackURL:googleConfiguration.callbackUrl!,
      scope:['email','profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifiedCallback){

console.log(profile)




    const hashedPassword = await bcrypt.hash('password', 10);  

    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      first_name: profile.name.givenName,
      last_name: profile.name.familyName,
      password:hashedPassword
  });
  done(null,user)
}
}