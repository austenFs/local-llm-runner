import 'reflect-metadata';
import { inject, injectable } from "inversify";
import { MessageHandler } from "../messages/message-handler";
import { InjectionRegistry } from "../ioc/injection-registry";

@injectable()
export class ApiHandler {
    constructor(
        @inject(InjectionRegistry.MessageHandler) readonly messageHandler: MessageHandler
    ) {
    }
    public async ping() {
        console.log('ping');
        return await this.messageHandler.pingQwen()
    }
}
