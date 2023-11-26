import type { OpenAIToken } from "src/chatdb/entities/open-ai-token.entity";
import { PadLocalToken } from "src/chatdb/entities/pad-local-token.entity";

export interface TokenCreateRequest {
    type: 'openai' | 'pad-local';
    token: string;
}

export interface TokenCreateResponse extends OpenAIToken {
}

export interface TokenGetResponse {
    openai: OpenAIToken[];
    ['pad-local']: PadLocalToken[];
}