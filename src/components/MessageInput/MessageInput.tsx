// ===============================================
// メッセージ入力コンポーネント
// ===============================================

import React, { useState, useRef, KeyboardEvent } from 'react';
import { MessageInputProps } from '../../types/chat';
import './MessageInput.scss';

/**
 * メッセージ入力フィールドと送信ボタンを提供するコンポーネント
 * 要件定義書の仕様に基づいて実装：
 * - Enterキーまたは送信ボタンでメッセージ送信
 * - 送信中の状態表示（ローディング）
 * - 空メッセージの送信防止
 */
const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
  placeholder = "メッセージを入力してください..."
}) => {
  // 入力値の状態管理
  const [inputValue, setInputValue] = useState<string>('');
  
  // 入力フィールドの参照（フォーカス制御用）
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * 入力値の変更ハンドラー
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  /**
   * メッセージ送信処理
   */
  const handleSubmit = async () => {
    const trimmedValue = inputValue.trim();
    
    // 空メッセージの送信防止
    if (!trimmedValue || isLoading || disabled) {
      return;
    }

    try {
      // 入力値をクリア（送信前に行うことでUX向上）
      setInputValue('');
      
      // 親コンポーネントの送信関数を呼び出し
      await onSendMessage(trimmedValue);
      
      // 送信後に入力フィールドにフォーカスを戻す
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      // エラーが発生した場合は入力値を復元
      setInputValue(trimmedValue);
      console.error('Failed to send message:', error);
    }
  };

  /**
   * Enterキー押下時の処理
   * Shift+Enterの場合は改行、Enterのみの場合は送信
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // デフォルトの改行動作を防止
      handleSubmit();
    }
  };

  /**
   * 送信ボタンクリック時の処理
   */
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    handleSubmit();
  };

  // 送信可能かどうかの判定
  const canSend = inputValue.trim().length > 0 && !isLoading && !disabled;

  return (
    <div className="message-input">
      <div className="message-input__container">
        {/* 入力フィールド */}
        <div className="message-input__field-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="message-input__field"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "送信中..." : placeholder}
            disabled={disabled || isLoading}
            maxLength={1000} // 最大文字数制限
            aria-label="メッセージ入力フィールド"
            aria-describedby="message-input-help"
          />
          
          {/* 文字数カウンター（長文の場合に表示） */}
          {inputValue.length > 800 && (
            <div className="message-input__counter">
              {inputValue.length}/1000
            </div>
          )}
        </div>

        {/* 送信ボタン */}
        <button
          type="button"
          className={`message-input__button ${canSend ? 'message-input__button--active' : ''}`}
          onClick={handleButtonClick}
          disabled={!canSend}
          aria-label="メッセージを送信"
        >
          {isLoading ? (
            <span className="message-input__loading">
              <span className="message-input__loading-dots"></span>
            </span>
          ) : (
            <span className="message-input__send-icon">
              ➤
            </span>
          )}
        </button>
      </div>

      {/* ヘルプテキスト（スクリーンリーダー用） */}
      <div id="message-input-help" className="visually-hidden">
        Enterキーで送信、Shift+Enterで改行
      </div>
    </div>
  );
};

export default MessageInput;