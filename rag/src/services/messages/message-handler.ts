import 'reflect-metadata';
import { OllamaRequest, OllamaResponse } from "../../interfaces/ollama-message.interface";
import { config } from "../../config/config";
import axios from "axios";
import { injectable } from "inversify";

@injectable()
export class MessageHandler {
    private readonly ollamaUrl = config.values.ollamaUrl;
    private readonly model = config.values.defaultModel;
    constructor() { }
    public async pingQwen(): Promise<string> {
    try {

        // Check if Ollama is running
        const healthCheck = await axios.get(`${this.ollamaUrl}/api/tags`);
        console.log('✅ Ollama is running');

        // Check if model is available
        const models = healthCheck.data.models || [];
        // const hasQwen = models.some((m: any) => m.name.includes('qwen2.5-coder'));


        // Send a simple ping/hello message
        const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
            model: this.model,
            prompt: 'pinging',
            stream: false
        });

        const data: OllamaResponse = response.data;

        console.log(data.response);
        return data.response
    } catch (error) {
 
    }
    return 'ERROR';
}
}