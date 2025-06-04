// ===============================================
// チャットAPI通信サービス
// ===============================================

import { ChatRequest, ChatResponse } from '../types/chat';

/**
 * APIのベースURL（環境変数から取得、デフォルトは開発用）
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * APIリクエストのタイムアウト時間（ミリ秒）
 */
const REQUEST_TIMEOUT = 10000; // 10秒

/**
 * カスタムエラークラス
 */
export class ChatServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ChatServiceError';
  }
}

/**
 * タイムアウト付きfetch関数
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ChatServiceError('リクエストがタイムアウトしました');
    }
    throw error;
  }
};

/**
 * チャットサービスクラス
 */
export class ChatService {
  /**
   * メッセージを送信してボットの返答を取得
   */
  static async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const url = `${API_BASE_URL}/chat`;
      
      console.log('Sending message to:', url, request);

      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // ステータスコードのチェック
      if (!response.ok) {
        const errorText = await response.text();
        throw new ChatServiceError(
          `サーバーエラーが発生しました: ${response.status}`,
          response.status
        );
      }

      const data: ChatResponse = await response.json();
      
      // レスポンスデータの検証
      if (!data || typeof data.response !== 'string') {
        throw new ChatServiceError('不正なレスポンス形式です');
      }

      return data;

    } catch (error) {
      console.error('Chat service error:', error);

      // 既にChatServiceErrorの場合はそのまま再throw
      if (error instanceof ChatServiceError) {
        throw error;
      }

      // ネットワークエラーの場合
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ChatServiceError(
          'ネットワークエラーが発生しました。接続を確認してください。',
          undefined,
          error
        );
      }

      // その他のエラー
      throw new ChatServiceError(
        '予期しないエラーが発生しました',
        undefined,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * サーバーの健康チェック（開発用）
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const url = `${API_BASE_URL}/health`;
      const response = await fetchWithTimeout(url, {
        method: 'GET',
      }, 3000); // 短いタイムアウト

      return response.ok;
    } catch (error) {
      console.warn('Health check failed:', error);
      return false;
    }
  }
}

/**
 * デバッグ用のモックサービス（開発時のテスト用）
 */
export class MockChatService {
  static async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    // 人工的な遅延を追加（実際のAPI通信をシミュレート）
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // シンプルなエコーボット
    const responses = [
      `こんにちは！「${request.message}」というメッセージを受け取りました。`,
      `「${request.message}」について、もう少し詳しく教えていただけますか？`,
      `なるほど、「${request.message}」ですね。興味深いですね！`,
      `「${request.message}」に関して、他にご質問はありますか？`,
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      response: randomResponse,
    };
  }
}

/**
 * 環境に応じてサービスを切り替え
 * 開発環境でバックエンドが起動していない場合はモックを使用
 */
export const getChatService = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const useMock = process.env.REACT_APP_USE_MOCK === 'true';
  
  if (isDevelopment && useMock) {
    console.warn('🔧 MockChatServiceを使用しています');
    return MockChatService;
  }
  
  return ChatService;
};