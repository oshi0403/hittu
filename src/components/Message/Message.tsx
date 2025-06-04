// ===============================================
// 個別メッセージ表示コンポーネント
// ===============================================

import React from 'react';
import { MessageProps } from '../../types/chat';
import { formatMessageTime } from '../../utils/dateUtils';
import './Message.scss';

/**
 * 個別のメッセージを表示するコンポーネント
 * ユーザーメッセージとボットメッセージを区別して表示
 */
const Message: React.FC<MessageProps> = ({ message }) => {
  const { content, sender, timestamp, isLoading } = message;
  
  // メッセージの種類に応じたCSSクラス名を生成
  const messageClass = `message message--${sender}`;
  
  // ローディング状態のクラス名
  const loadingClass = isLoading ? 'message--loading' : '';
  
  // 時刻表示用の文字列を生成
  const timeString = formatMessageTime(timestamp);

  return (
    <div className={`${messageClass} ${loadingClass}`.trim()}>
      {/* メッセージバブル */}
      <div className="message__bubble">
        {/* メッセージ内容 */}
        <div className="message__content">
          {isLoading ? (
            <span className="message__loading-text">
              入力中
              <span className="message__loading-dots"></span>
            </span>
          ) : (
            content
          )}
        </div>
        
        {/* 時刻表示 */}
        {!isLoading && timeString && (
          <div className="message__timestamp">
            {timeString}
          </div>
        )}
      </div>
      
      {/* アバター（将来的に追加可能） */}
      {sender === 'bot' && (
        <div className="message__avatar">
          🤖
        </div>
      )}
    </div>
  );
};

export default Message;