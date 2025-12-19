import React, { useState, useEffect} from 'react';
import { MessageProps } from '../../types/chat';
import { formatMessageTime } from '../../utils/dateUtils';
import TypewriterText from '../Typewriter/Typewriter';
import './Message.scss';

// アイコンコンポーネント（SVG）
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const Message: React.FC<MessageProps> = ({ message, isLastBotMessage, scrollToBottom, onSuggestionClick }) => {
  const { content, sender, timestamp, isLoading, suggestions } = message;
  const [isCopied, setIsCopied] = useState(false);
  const [isTypingDone, setIsTypingDone] = useState(false);

    useEffect(() => {
    if(sender === 'bot'){
      setIsTypingDone(false);
    }
  },[message.id, sender]);
  
  const messageClass = `message message--${sender}`;
  const loadingClass = isLoading ? 'message--loading' : '';
  const timeString = formatMessageTime(timestamp);



  // コピー処理
  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`${messageClass} ${loadingClass}`.trim()}>
      <div className="message__bubble">
        <div className="message__content">
          {isLoading ? (
            <span className="message__loading-text">
              入力中
              <span className="message__loading-dots"></span>
            </span>
          ) : isLastBotMessage ? (
            <TypewriterText 
              text={content} 
              scrollToBottom={scrollToBottom}
              onDone = {() => setIsTypingDone(true)} 
            />
          ) : (
            content
          )}
        </div>

                {/* ★追加提案（botのみ） */}
        {sender === 'bot' && !isLoading && isTypingDone && suggestions?.length ? (
          <div className="message__suggestions">
            <div className="message__suggestions-title">こちらの質問もできます：</div>
            <div className="message__suggestions-grid">
              {suggestions.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  className="message-input__prediction-button"
                  onClick={() => onSuggestionClick(q.content)}
                >
                  {q.content}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        
        {/* フッターエリア（タイムスタンプとコピーボタン） */}
        <div className="message__footer">
          {!isLoading && timeString && (
            <span className="message__timestamp">
              {timeString}
            </span>
          )}

          {/* ボットかつロード中でない場合にコピーボタンを表示 */}
          {sender === 'bot' && !isLoading && (
            <button 
              className="message__copy-button" 
              onClick={handleCopy}
              title="メッセージをコピー"
              aria-label="メッセージをコピー"
            >
              {isCopied ? (
                <span className="message__copy-success">
                  <CheckIcon /> Copied
                </span>
              ) : (
                <span className="message__copy-icon">
                  <CopyIcon />
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;

