import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidV4 } from 'uuid';
import { RequestLogger } from 'logger/request-logger.service';
import Cryptr from 'cryptr';
import { decode } from 'jsonwebtoken';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private getToken = (request) => {
    let token = null;
    try {
      if (request.headers.authorization) {
        token = request.headers.authorization
          .replace('Bearer ', '')
          .replace(' ', '');
      } else if (request.headers.bearer) {
        token = request.headers.bearer;
      } else if (request.body.token) {
        token = request.body.token.replace(' ', '');
      } else if (request.query.token) {
        token = request.body.token.replace(' ', '');
      }
      return token;
    } catch (error) {
      return token;
    }
  };

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const id = uuidV4();
    const request = context.switchToHttp().getRequest();
    const { method, query, body, ip, routerPath, params, protocol } = request;
    const cryptr = new Cryptr(process.env.ENCRYPT_JWT_SECRET);
    let token = this.getToken(request);

    if (token) {
      token = cryptr.decrypt(token);
      const { userId } = decode(token, { json: true });
      RequestLogger.log(
        { id, userId, method, query, body, ip, routerPath, params, protocol },
        'Request',
      );
    }

    RequestLogger.log(
      { id, method, query, body, ip, routerPath, params, protocol },
      'Request',
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const time = `${Date.now() - now}ms`;
          console.log(`${routerPath} ... ${time}`);
          RequestLogger.log({ id, time }, 'Response');
        },
        error: (error) => {
          const time = `${Date.now() - now}ms`;
          console.log(`${routerPath} ... ${time}`);
          RequestLogger.error({ id, time }, error, 'Response');
        },
      }),
    );
  }
}
