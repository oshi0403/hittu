import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import MessageInput from '../MessageInput/MessageInput';
import MessageList from '../MessageList/MessageList';
import { ChatContainerProps, PredictedQuestion } from '../../types/chat';
import { Message as MessageType } from '../../types/chat';
import { generateMessageId, getCurrentTime } from '../../utils/dateUtils';
import hittuLogo from '../../assets/images/logos/hittu-logo.png';
import './ChatContainer.scss';

const ChatContainer: React.FC<ChatContainerProps> = ({
  title,
  placeholder
}) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 質問予測機能のための状態
  const [predictedQuestions, setPredictedQuestions] = useState<PredictedQuestion[]>([]);
  // ユーザーのタイピング中の入力
  const [userTypingQuery, setUserTypingQuery] = useState('');
  // 質問予測APIを呼び出すためのトリガー
  const [predictTrigger, setPredictTrigger] = useState<string>('');

  // デバウンス処理のためのRef
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // レイアウト計算のためのRef
  const headerRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  // ヘッダーとフッターの高さを取得し、メインエリアのパディングを設定
  useLayoutEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
    if (footerRef.current) {
      setFooterHeight(footerRef.current.offsetHeight);
    }
  }, []);

  // ユーザーの入力に合わせて質問予測APIを呼び出す
useEffect(() => {
  // 予測トリガーが空なら予測をクリアして終了
  if (!predictTrigger) {
    setPredictedQuestions([]);
    return;
  }

  // この useEffect 実行インスタンスが「有効かどうか」を示すフラグ
  let isCancelled = false;

  const fetchPredictions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: predictTrigger }),
      });

      if (!response.ok) {
        throw new Error('質問予測APIからの応答が異常です。');
      }

      const data = await response.json();

      // ★ ここでキャンセル済みなら state を更新しない
      if (isCancelled) return;

      const newPredictedQuestions = data.predictions.map((q: string, index: number) => ({
        content: q,
        id: `pred-${index}`,
      }));
      setPredictedQuestions(newPredictedQuestions);
    } catch (error) {
      if (isCancelled) return; // ここでも同様に無視
      console.error('質問予測API呼び出しエラー:', error);
      setPredictedQuestions([]);
    }
  };

  fetchPredictions();

  // cleanup: predictTrigger が変わったり、コンポーネントがアンマウントされたときに呼ばれる
  return () => {
    isCancelled = true;
  };
}, [predictTrigger]);


const handleSendMessage = useCallback(
  async (content: string, suggestions?: PredictedQuestion[]) => {
    if (isLoading || !content.trim()) return;

    // ✅ このターンで「AI回答の末尾に付ける候補」を確定させる
    // - 予測候補クリック経由なら suggestions(=remaining) が渡ってくる
    // - 通常送信なら predictedQuestions をそのまま使う（未選択扱い）
    const suggestionsForThisTurn = suggestions ?? [];

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setPredictTrigger('');
    setPredictedQuestions([]);

    // ユーザーのメッセージ
    const userMessage: MessageType = {
      id: generateMessageId(),
      sender: 'user',
      content,
      timestamp: new Date(),
      isLoading: false,
    };
    setMessages(prev => [...prev, userMessage]);

    setUserTypingQuery('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) throw new Error('チャットボットAPIからの応答が異常です。');

      const data = await response.json();
      const botResponseContent = data.response;
      

      // ✅ botメッセージに suggestions を付ける
      const botMessage: MessageType = {
        id: generateMessageId(),
        sender: 'bot',
        content: botResponseContent,
        timestamp: new Date(),
        isLoading: false,
        suggestions: suggestionsForThisTurn.length ? suggestionsForThisTurn : undefined,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('メッセージ送信中にエラーが発生しました:', err);
      setError('メッセージの送信中に問題が発生しました。時間をおいて再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  },
  [isLoading, predictedQuestions]
);

  const handlePredictedQuestionClick = useCallback((question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    // selected を除外した remaining を作る（content一致で除外）
    const remaining = predictedQuestions.filter(q => q.content !== trimmed);

    // UI上の候補は消す（好みで）
    setPredictedQuestions([]);
    setPredictTrigger('');
    setUserTypingQuery('');

    console.log("remaining", remaining);
    handleSendMessage(trimmed, remaining);
  }, [predictedQuestions, handleSendMessage, isLoading]);

  const handleTypingChange = useCallback((text: string) => {
    setUserTypingQuery(text);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text.length > 2) {
      debounceTimerRef.current = setTimeout(() => {
        setPredictTrigger(text);
      }, 500);
    } else {
      setPredictTrigger('');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleClearMessages = useCallback(() => {
    setMessages([]);
    clearError();
  }, [clearError]);

  const handleMenuClick = useCallback(() => {
    console.log('Menu clicked');
  }, []);

  const handleCloseError = useCallback(() => {
    clearError();
  }, [clearError]);

  return (
    <div className="chat-container">
      <header className="chat-container__header" ref={headerRef}>
        <div className="chat-container__header-content">
          <h1 className="chat-container__title">
            <img
              src={hittuLogo}
              alt="Hittu チャットボット"
              className="chat-container__title-icon"
            />
            {title}
          </h1>
          {/* <button
            className="chat-container__menu-button"
            onClick={handleMenuClick}
            aria-label="メニューを開く"
            title="設定・オプション"
          >
            <span className="chat-container__menu-icon">⋮</span>
          </button> */}
        </div>
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
      <main
        className="chat-container__main">
        <div className="chat-container__messages">
          <MessageList
            messages={messages}
            onSuggestionClick={(text) => handleSendMessage(text)}
          />
        </div>
      </main>
      <footer className="chat-container__footer" ref={footerRef}>
        <MessageInput
          onSendMessage={handleSendMessage}
          onTypingChange={handleTypingChange}
          isLoading={isLoading}
          placeholder={placeholder}
          disabled={!!error}
          predictedQuestions={predictedQuestions}
          onPredictedQuestionClick={handlePredictedQuestionClick}
          value={userTypingQuery} // ここに `userTypingQuery` を渡す
        />
      </footer>
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