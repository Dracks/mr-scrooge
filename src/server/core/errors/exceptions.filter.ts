import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { FastifyRequest, FastifyReply } from 'fastify';
import { Exception, HttpException as CustomHttpException } from "./exception";


@Catch()
export class AllExceptionsHandler implements ExceptionFilter {

    readonly logger = new Logger(AllExceptionsHandler.name)

    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<FastifyReply>();
      const request = ctx.getRequest<FastifyRequest>();
      if (exception instanceof HttpException){
        const status = exception.getStatus();
        this.logger.log(exception)
        response
            .status(status)
            .send({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            });
      }else if (exception instanceof Exception){
          const {message: msg, stackCodes, errorCode, cause, stack} = exception
          this.logger.error({path: request.url, errorCode, rootCode:stackCodes[stackCodes.length-1], stack, cause, context: exception.context}, msg)
          // this.logger.error(exception)
          //this.logger.error({err: exception, stackCodes, cause}, msg)
          const status = exception instanceof CustomHttpException ? exception.statusCode : 500
          response.status(status).send({
              statusCode: status,
              timestamp: new Date().toISOString(),
              path: request.url,
          })
      } else {
          const msg = exception instanceof Error ? exception.message : "Unknown class thrown"
          this.logger.error({path: request.url, exception}, msg)
          const status = 500
          response.status(status).send({
              statusCode: status,
              timestamp: new Date().toISOString(),
              path: request.url,
          })
      }
    }
}
