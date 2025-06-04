// ===============================================
// チャットメインコンテナコンポーネント
// ===============================================

import React, { useState, useCallback } from 'react';
import MessageList from '../MessageList/MessageList';
import MessageInput from '../MessageInput/MessageInput';
import { ChatContainerProps } from '../../types/chat';
import { Message as MessageType } from '../../types/chat';
import { generateMessageId, getCurrentTime } from '../../utils/dateUtils';
import hittuLogo from '../../assets/images/logos/hittu.png';
import './ChatContainer.scss';

/**
 * チャットアプリケーション全体を管理するメインコンテナコンポーネント
 * 要件定義書の仕様に基づいて実装：
 * - ヘッダー部分（チャットボット名/タイトル、メニューボタン）
 * - メッセージエリア（MessageList統合）
 * - 入力エリア（MessageInput統合、画面下部固定）
 * - 全体のレイアウト構成とレスポンシブ対応
 */
const ChatContainer: React.FC<ChatContainerProps> = ({
  title = "チャットボット",
  placeholder = "メッセージを入力してください..."
}) => {
  // メッセージ状態の管理
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: 'bot-welcome',
      content: 'こんにちは！何かお手伝いできることはありますか？',
      sender: 'bot',
      timestamp: new Date(Date.now() - 60000), // 1分前
    }
  ]);
  
  // ローディング状態の管理
  const [isLoading, setIsLoading] = useState(false);

  // エラー状態の管理
  const [error, setError] = useState<string | null>(null);

  /**
   * ボットの返答をシミュレート（後でAPI連携に置き換え）
   */
  const generateBotResponse = useCallback((userMessage: string): string => {
    const responses = [
      `「${userMessage}」について、もう少し詳しく教えていただけますか？`,
      `なるほど、「${userMessage}」ですね。興味深いですね！`,
      `「${userMessage}」に関して、他にご質問はありますか？`,
      `ありがとうございます！「${userMessage}」について理解しました。`,
      `「${userMessage}」というトピックは面白いですね。他にも何かありますか？`,
      `「${userMessage}」に関連して、以下のような点も考慮してみてはいかがでしょうか？\n\n• ポイント1: 具体的な例を考える\n• ポイント2: 他の視点から見る\n• ポイント3: 実践的な応用を検討する`,
      `素晴らしい質問ですね！「${userMessage}」について、詳しく説明させていただきます。\n\nまず基本的な概念から始めて、具体例を交えながら解説していきましょう。`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }, []);

  /**
   * エラー状態をクリア
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * メッセージ送信処理
   */
  const handleSendMessage = useCallback(async (content: string) => {
    try {
      // エラー状態をクリア
      clearError();
      setIsLoading(true);

      // ユーザーメッセージを追加
      const userMessage: MessageType = {
        id: generateMessageId(),
        content,
        sender: 'user',
        timestamp: getCurrentTime(),
      };

      setMessages(prev => [...prev, userMessage]);

      // ローディング中のボットメッセージを追加
      const loadingBotMessage: MessageType = {
        id: generateMessageId(),
        content: '',
        sender: 'bot',
        timestamp: getCurrentTime(),
        isLoading: true,
      };

      setMessages(prev => [...prev, loadingBotMessage]);

      // 人工的な遅延（実際のAPI通信をシミュレート）
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // ボットの返答を生成
      const botResponse = generateBotResponse(content);

      // ローディングメッセージを実際のレスポンスで置き換え
      setMessages(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 
            ? { ...msg, content: botResponse, isLoading: false, timestamp: getCurrentTime() }
            : msg
        )
      );

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // エラー時はローディングメッセージを削除
      setMessages(prev => prev.slice(0, -1));
      
      // エラー状態を設定
      setError('メッセージの送信に失敗しました。もう一度お試しください。');
      
    } finally {
      setIsLoading(false);
    }
  }, [generateBotResponse, clearError]);

  /**
   * メッセージ履歴をクリア
   */
  const handleClearMessages = useCallback(() => {
    setMessages([]);
    clearError();
  }, [clearError]);

  /**
   * メニューボタンクリック処理（将来の拡張用）
   */
  const handleMenuClick = useCallback(() => {
    // 将来的にメニュー機能を実装
    console.log('Menu clicked');
  }, []);

  /**
   * エラー表示を閉じる
   */
  const handleCloseError = useCallback(() => {
    clearError();
  }, [clearError]);

  return (
    <div className="chat-container">
      {/* ヘッダー部分 */}
      <header className="chat-container__header">
        <div className="chat-container__header-content">
          {/* タイトル */}
          <h1 className="chat-container__title">
            <img 
              src={hittuLogo} 
              alt="Hittu チャットボット" 
              className="chat-container__title-icon"
            />
            {title}
          </h1>

          {/* メニューボタン（将来の拡張用） */}
          <button
            className="chat-container__menu-button"
            onClick={handleMenuClick}
            aria-label="メニューを開く"
            title="設定・オプション"
          >
            <span className="chat-container__menu-icon">⋮</span>
          </button>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="chat-container__error" role="alert">
            <div className="chat-container__error-content">
              <span className="chat-container__error-icon">⚠️</span>
              <span className="chat-container__error-message">{error}</span>
              <button
                className="chat-container__error-close"
                onClick={handleCloseError}
                aria-label="エラーを閉じる"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </header>

      {/* メッセージエリア */}
      <main className="chat-container__main">
        <div className="chat-container__messages">
          <MessageList messages={messages} />
        </div>
      </main>

      {/* 入力エリア（画面下部固定） */}
      <footer className="chat-container__footer">
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder={placeholder}
          disabled={!!error} // エラー時は入力無効
        />
      </footer>

      {/* デバッグ用コントロール（開発時のみ表示） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="chat-container__debug">
          <button
            className="chat-container__debug-button"
            onClick={handleClearMessages}
            title="メッセージをクリア"
          >
            🗑️ Clear
          </button>
          <div className="chat-container__debug-info">
            Messages: {messages.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;