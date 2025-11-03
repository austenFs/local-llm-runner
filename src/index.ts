import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.MODEL || 'qwen2.5-coder';

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

async function pingQwen(): Promise<void> {
  try {
    console.log('🔍 Checking Ollama connection...');
    console.log(`📍 Connecting to: ${OLLAMA_URL}\n`);
    
    // Wait a bit for Ollama to be ready (when running in Docker)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if Ollama is running
    const healthCheck = await axios.get(`${OLLAMA_URL}/api/tags`);
    console.log('✅ Ollama is running');
    
    // Check if model is available
    const models = healthCheck.data.models || [];
    const hasQwen = models.some((m: any) => m.name.includes('qwen2.5-coder'));
    
    if (!hasQwen) {
      console.log('⚠️  Qwen2.5-coder model not found. Pull it with:');
      console.log('   docker compose exec ollama ollama pull qwen2.5-coder');
      return;
    }
    
    console.log('✅ Qwen2.5-coder model is available\n');
    console.log('📤 Sending ping message to Qwen...\n');
    
    // Send a simple ping/hello message
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: MODEL,
      prompt: 'ping test',
      stream: false
    });
    
    const data: OllamaResponse = response.data;
    
    console.log('📥 Response from Qwen2.5-coder:');
    console.log('─'.repeat(50));
    console.log(data.response);
    console.log('─'.repeat(50));
    console.log('\n✅ Ping successful! Qwen is working properly.');
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ Cannot connect to Ollama. Make sure Docker is running:');
        console.error('   npm run docker:up');
      } else {
        console.error('❌ Error:', error.message);
      }
    } else {
      console.error('❌ Unexpected error:', error);
    }
    process.exit(1);
  }
}

pingQwen();