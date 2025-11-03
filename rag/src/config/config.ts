
export class config {
    static values = {
        // Use the OLLAMA_URL env var if present, otherwise fall back to the default
        ollamaUrl: process.env.OLLAMA_URL || 'http://ollama:11434',
        defaultModel: process.env.MODEL || 'qwen2.5-coder'
    };
}