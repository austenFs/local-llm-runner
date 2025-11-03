import { Container } from "inversify";
import { MessageHandler } from "../messages/message-handler";
import { InjectionRegistry } from "./injection-registry";
import { ApiHandler } from "../API/api-handler";
const container = new Container();
container.bind<MessageHandler>(InjectionRegistry.MessageHandler).to(MessageHandler).inSingletonScope();
container.bind<ApiHandler>(InjectionRegistry.ApiHandler).to(ApiHandler).inSingletonScope();

export { container }