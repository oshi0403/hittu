// ===============================================
// メッセージ一覧コンポーネント
// ===============================================

import React, { useEffect, useRef, useCallback } from 'react';
import { MessageListProps } from '../../types/chat';
import Message from '../Message/Message';
import './MessageList.scss';

/**
 * メッセージ一覧を表示・管理するコンポーネント
 * 要件定義書の仕様に基づいて実装：
 * - 複数メッセージの表示管理
 * - 新しいメッセージが来たら自動スクロール
 * - スクロールバーカスタマイズ
 * - パフォーマンス最適化
 */
const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  // スクロール制御用のref
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabledRef = useRef<boolean>(true);
  const lastMessageCountRef = useRef<number>(0);

  /**
   * 最下部までスクロールする関数
   */
  const scrollToBottom = useCallback((smooth: boolean = true) => {
    if (scrollContainerRef.current) {
      const scrollOptions: ScrollToOptions = {
        top: scrollContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      };
      scrollContainerRef.current.scrollTo(scrollOptions);
    }
  }, []);

  /**
   * ユーザーがスクロール位置を手動で変更したかチェック
   */
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px の余裕

    // ユーザーが下部付近にいる場合は自動スクロールを有効、そうでなければ無効
    isAutoScrollEnabledRef.current = isNearBottom;
  }, []);

  /**
   * 新しいメッセージが追加された時の自動スクロール処理
   */
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = lastMessageCountRef.current;

    // メッセージが新しく追加された場合
    if (currentMessageCount > previousMessageCount) {
      // 初回読み込み時は即座にスクロール（アニメーションなし）
      if (previousMessageCount === 0) {
        setTimeout(() => scrollToBottom(false), 10);
      } 
      // 自動スクロールが有効な場合のみスムーズスクロール
      else if (isAutoScrollEnabledRef.current) {
        setTimeout(() => scrollToBottom(true), 100);
      }
    }

    // メッセージ数を更新
    lastMessageCountRef.current = currentMessageCount;
  }, [messages.length, scrollToBottom]);

  /**
   * 最下部へのスクロールボタンクリック処理
   */
  const handleScrollToBottomClick = useCallback(() => {
    scrollToBottom(true);
    isAutoScrollEnabledRef.current = true; // 自動スクロールを再有効化
  }, [scrollToBottom]);

  /**
   * 自動スクロールが無効かどうかの判定
   */
  const shouldShowScrollButton = !isAutoScrollEnabledRef.current && messages.length > 3;

  // 空の状態の処理
  if (messages.length === 0) {
    return (
      <div className="message-list message-list--empty">
        <div className="message-list__empty-state">
          <div className="message-list__empty-icon">💬</div>
          <div className="message-list__empty-title">
            会話を始めましょう
          </div>
          <div className="message-list__empty-description">
            下のメッセージ入力欄から、何でもお気軽にお話しください。
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {/* メッセージコンテナ */}
      <div
        ref={scrollContainerRef}
        className="message-list__container"
        onScroll={handleScroll}
        role="log"
        aria-label="チャット履歴"
        aria-live="polite"
      >
        {/* メッセージ一覧 */}
        <div className="message-list__content">
          {messages.map((message, index) => (
            <div 
              key={message.id}
              className="message-list__item"
              role="listitem"
            >
              <Message message={message} />
            </div>
          ))}
        </div>

        {/* スクロール開始時のグラデーション（視覚的フィードバック） */}
        <div className="message-list__gradient-top" />
        <div className="message-list__gradient-bottom" />
      </div>

      {/* 最下部スクロールボタン（自動スクロール無効時に表示） */}
      {shouldShowScrollButton && (
        <button
          className="message-list__scroll-button"
          onClick={handleScrollToBottomClick}
          aria-label="最新メッセージまでスクロール"
          title="最新メッセージまでスクロール"
        >
          <span className="message-list__scroll-icon">↓</span>
          <span className="message-list__scroll-text">最新</span>
        </button>
      )}

      {/* メッセージ数のスクリーンリーダー用情報 */}
      <div className="visually-hidden" aria-live="polite">
        {messages.length > 0 && `${messages.length}件のメッセージが表示されています`}
      </div>
    </div>
  );
};

export default MessageList;