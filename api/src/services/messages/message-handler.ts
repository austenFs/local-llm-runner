import 'reflect-metadata';
import { OllamaRequest, OllamaResponse } from "../../interfaces/ollama-message.interface";
import { config } from "../../config/config";
import axios from "axios";
import { injectable } from "inversify";

@injectable()
export class MessageHandler {
    private readonly ollamaUrl = config.values.ollamaUrl;
    private readonly model = config.values.defaultModel;
    private llmOn = false;
    
    constructor() {
        this.healthCheck();
     }

    public async healthCheck():  Promise<boolean> {
        const healthCheck = await axios.get(`${this.ollamaUrl}/api/tags`);
        this.llmOn = healthCheck.status == 200;
        return this.llmOn;
    }

    public async pingQwen(): Promise<string> {
        try {
            if( this.llmOn) {
                const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
                    model: this.model,
                    prompt: 'pinging',
                    stream: false
                });
    
                const data: OllamaResponse = response.data;
    
                console.log(data.response);
                return data.response
            }

        } catch (error) {
            console.log(error);
        }
        return 'ERROR';
    }
    public async sendMessage(prompt: string): Promise<string> {
        try {
            if(this.llmOn) {
                const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
                    model: this.model,
                    prompt,
                    stream: false
                });
    
                const data: OllamaResponse = response.data;
    
                console.log(data.response);
                return data.response
            }
        } catch (error) {
            console.log(error);
        }
        return 'ERROR';
    }
}
