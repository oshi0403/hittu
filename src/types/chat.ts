// ===============================================
// チャットボット関連の型定義
// ===============================================

/**
 * メッセージの送信者タイプ
 */
export type MessageSender = 'user' | 'bot';

/**
 * メッセージオブジェクト
 */
export interface Message {
  id: string;
  content: string;
  sender: MessageSender;
  timestamp: Date;
  isLoading?: boolean;
}

/**
 * チャット状態
 */
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

/**
 * API リクエスト形式
 */
export interface ChatRequest {
  message: string;
}

/**
 * API レスポンス形式
 */
export interface ChatResponse {
  response: string;
}

/**
 * チャットフック用の戻り値の型
 */
export interface UseChatReturn {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearMessages: () => void;
}

/**
 * メッセージコンポーネントのProps
 */
export interface MessageProps {
  message: Message;
}

/**
 * メッセージ入力コンポーネントのProps
 */
export interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * メッセージリストコンポーネントのProps
 */
export interface MessageListProps {
  messages: Message[];
}

/**
 * チャットコンテナコンポーネントのProps
 */
export interface ChatContainerProps {
  title?: string;
  placeholder?: string;
}