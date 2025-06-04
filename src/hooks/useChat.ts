// ===============================================
// チャット機能のカスタムフック
// ===============================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, ChatState, UseChatReturn } from '../types/chat';
import { getChatService, ChatServiceError } from '../services/chatService';
import { generateMessageId, getCurrentTime } from '../utils/dateUtils';

/**
 * チャット機能を提供するカスタムフック
 */
export const useChat = (): UseChatReturn => {
  // チャット状態の管理
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  // チャットサービスの取得
  const chatService = getChatService();
  
  // 重複送信を防ぐためのref
  const isSendingRef = useRef(false);

  /**
   * エラー状態をクリア
   */
  const clearError = useCallback(() => {
    setChatState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * メッセージを追加
   */
  const addMessage = useCallback((message: Message) => {
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  /**
   * 最後のメッセージを更新（ローディング状態の更新などに使用）
   */
  const updateLastMessage = useCallback((updates: Partial<Message>) => {
    setChatState(prev => ({
      ...prev,
      messages: prev.messages.map((msg, index) => 
        index === prev.messages.length - 1 
          ? { ...msg, ...updates }
          : msg
      ),
    }));
  }, []);

  /**
   * ユーザーメッセージを作成
   */
  const createUserMessage = useCallback((content: string): Message => {
    return {
      id: generateMessageId(),
      content: content.trim(),
      sender: 'user',
      timestamp: getCurrentTime(),
    };
  }, []);

  /**
   * ボットメッセージを作成
   */
  const createBotMessage = useCallback((content: string, isLoading = false): Message => {
    return {
      id: generateMessageId(),
      content,
      sender: 'bot',
      timestamp: getCurrentTime(),
      isLoading,
    };
  }, []);

  /**
   * メッセージ送信処理
   */
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    // 入力値の検証
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      console.warn('Empty message attempted to send');
      return;
    }

    // 重複送信防止
    if (isSendingRef.current) {
      console.warn('Message already being sent');
      return;
    }

    try {
      isSendingRef.current = true;
      
      // エラー状態をクリア
      clearError();

      // ローディング状態に設定
      setChatState(prev => ({ ...prev, isLoading: true }));

      // ユーザーメッセージを追加
      const userMessage = createUserMessage(trimmedContent);
      addMessage(userMessage);

      // ローディング中のボットメッセージを追加
      const loadingBotMessage = createBotMessage('', true);
      addMessage(loadingBotMessage);

      // APIリクエスト送信
      const response = await chatService.sendMessage({
        message: trimmedContent,
      });

      // ローディングメッセージを実際のレスポンスで更新
      updateLastMessage({
        content: response.response,
        isLoading: false,
        timestamp: getCurrentTime(),
      });

    } catch (error) {
      console.error('Failed to send message:', error);

      // ローディングメッセージを削除
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.slice(0, -1),
      }));

      // エラーメッセージを設定
      let errorMessage = '送信に失敗しました。';
      
      if (error instanceof ChatServiceError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = `エラー: ${error.message}`;
      }

      setChatState(prev => ({
        ...prev,
        error: errorMessage,
      }));

    } finally {
      // ローディング状態を解除
      setChatState(prev => ({ ...prev, isLoading: false }));
      isSendingRef.current = false;
    }
  }, [chatService, clearError, addMessage, createUserMessage, createBotMessage, updateLastMessage]);

  /**
   * メッセージ履歴をクリア
   */
  const clearMessages = useCallback(() => {
    setChatState({
      messages: [],
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * 初期化時にウェルカムメッセージを表示（オプション）
   */
  useEffect(() => {
    const welcomeMessage = createBotMessage(
      'こんにちは！何かお手伝いできることはありますか？'
    );
    
    // 初回のみウェルカムメッセージを表示
    setChatState(prev => 
      prev.messages.length === 0 
        ? { ...prev, messages: [welcomeMessage] }
        : prev
    );
  }, [createBotMessage]);

  // エラーが発生した場合の自動クリア（10秒後）
  useEffect(() => {
    if (chatState.error) {
      const timer = setTimeout(clearError, 10000);
      return () => clearTimeout(timer);
    }
  }, [chatState.error, clearError]);

  return {
    messages: chatState.messages,
    sendMessage,
    isLoading: chatState.isLoading,
    error: chatState.error,
    clearMessages,
  };
};