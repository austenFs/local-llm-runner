export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export interface OllamaRequest {
    model: string,
    prompt: string,
    stream: boolean
}
