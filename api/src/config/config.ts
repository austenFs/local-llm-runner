
export class config {
    static values = {
        ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
        defaultModel: process.env.MODEL || 'qwen2.5-coder'
    };
}