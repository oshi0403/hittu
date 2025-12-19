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
  suggestions?: PredictedQuestion[];//追加提案用の型
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

// 質問予測機能のための新しい型
export interface PredictedQuestion {
  content: string;
  id: string; // 予測された質問を識別するためのID
}

/**
 * メッセージ入力コンポーネントのProps
 */
export interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  predictedQuestions: PredictedQuestion[];
  onPredictedQuestionClick: (question: string) => void;
  onTypingChange: (text: string) => void;
  value: string; // 新しいプロパティを追加
}

/**
 * メッセージリストコンポーネントのProps
 */
export interface MessageProps {
  message: Message;
  isLastBotMessage: boolean;
  scrollToBottom: (smooth?: boolean) => void;
  onSuggestionClick: (content: string) => void; // ★追加
}

export interface MessageListProps {
  messages: Message[];
  onSuggestionClick: (content: string) => void;
}


/**
 * チャットコンテナコンポーネントのProps
 */
export interface ChatContainerProps {
  title?: string;
  placeholder?: string;
}