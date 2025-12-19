// MessageInput.tsx

import React, { useRef, KeyboardEvent } from 'react';
import { MessageInputProps } from '../../types/chat';
import './MessageInput.scss';

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingChange,
  isLoading,
  disabled = false,
  placeholder = "メッセージを入力してください...",
  predictedQuestions,
  onPredictedQuestionClick,
  value, // 新しく追加されたプロパティ
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    onTypingChange(value);
  };

const handlePredictedClick = (question: string) => {
  const trimmed = question.trim();
  if (!trimmed || isLoading || disabled) return;
  onPredictedQuestionClick(trimmed);
};

  
  const handleSubmit = async () => {
    const trimmedValue = value.trim(); // `value`を使用
    if (!trimmedValue || isLoading || disabled) {
      return;
    }
    onSendMessage(trimmedValue);
  };

  // Enterキー押下時の処理
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !isLoading && !disabled; // `value`を使用

  return (
    <div className="message-input">
      {predictedQuestions.length > 0 && (
        <div className="message-input__predictions">
          {predictedQuestions.map((q) => (
            <button
              key={q.id}
              className="message-input__prediction-button"
              onClick={() => handlePredictedClick(q.content)}
              disabled={isLoading || disabled}
            >
              {q.content}
            </button>
          ))}
        </div>
      )}

      <div className="message-input__container">
        <textarea
          ref={inputRef}
          className="message-input__field"
          value={value} // ここで親から渡された `value` を使用
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "送信中..." : placeholder}
          disabled={disabled || isLoading}
          maxLength={1000}
          aria-label="メッセージ入力フィールド"
        ></textarea>
        
        <button
          type="button"
          className={`message-input__button ${canSend ? 'message-input__button--active' : ''}`}
          onClick={handleSubmit}
          disabled={!canSend}
          aria-label="メッセージを送信"
        >
          {isLoading ? (
            <span className="message-input__loading">
              <span className="message-input__loading-dots"></span>
            </span>
          ) : (
            <span className="message-input__send-icon">➤</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;