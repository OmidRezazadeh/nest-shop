import { HttpException, HttpStatus } from "@nestjs/common";


export class CustomHttpException extends HttpException {
    constructor(message: string, statusCode: number) {
        super(message, statusCode);
    }
}
export class NotFoundException extends CustomHttpException {
    constructor(message: string) {
        super(message, HttpStatus.NOT_FOUND);
    }    
}   
export class ForbiddenException extends CustomHttpException {
    constructor(message: string) {
        super(message, HttpStatus.FORBIDDEN);
    }    
}   

export class RequestTimeoutException extends CustomHttpException {
    constructor(message:string) {
        super(message, HttpStatus.REQUEST_TIMEOUT);
    }  

}


export class  UnauthorizedException extends CustomHttpException {
    constructor(message:string) {
        super(message,HttpStatus.UNAUTHORIZED)
    }
}



export class BadRequestException extends CustomHttpException {
        
    constructor(message: string) {
        super(message, HttpStatus.FORBIDDEN);
    }    
    }
