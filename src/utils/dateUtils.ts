// ===============================================
// 日付関連のユーティリティ関数
// ===============================================

/**
 * 日付をチャット用の表示形式にフォーマット
 * 例: "14:30", "昨日 14:30", "12/25 14:30"
 */
export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const messageDate = new Date(date);
  
  // 日付が無効な場合は空文字を返す
  if (isNaN(messageDate.getTime())) {
    return '';
  }

  const isToday = isSameDay(now, messageDate);
  const isYesterday = isSameDay(addDays(now, -1), messageDate);
  const isThisYear = now.getFullYear() === messageDate.getFullYear();

  // 時刻部分を取得
  const timeString = formatTime(messageDate);

  if (isToday) {
    return timeString; // "14:30"
  } else if (isYesterday) {
    return `昨日 ${timeString}`; // "昨日 14:30"
  } else if (isThisYear) {
    const month = messageDate.getMonth() + 1;
    const day = messageDate.getDate();
    return `${month}/${day} ${timeString}`; // "12/25 14:30"
  } else {
    const year = messageDate.getFullYear();
    const month = messageDate.getMonth() + 1;
    const day = messageDate.getDate();
    return `${year}/${month}/${day} ${timeString}`; // "2023/12/25 14:30"
  }
};

/**
 * 時刻を HH:MM 形式でフォーマット
 */
export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * 日付を YYYY/MM/DD 形式でフォーマット
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

/**
 * 詳細な日時を表示用にフォーマット
 * 例: "2024年6月4日 14:30"
 */
export const formatDetailedDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const timeString = formatTime(date);
  
  return `${year}年${month}月${day}日 ${timeString}`;
};

/**
 * 相対時間を表示（○分前、○時間前など）
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'たった今';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  } else if (diffHours < 24) {
    return `${diffHours}時間前`;
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else {
    return formatMessageTime(date);
  }
};

/**
 * 2つの日付が同じ日かどうかを判定
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * 日付に指定した日数を加算
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * 現在時刻を取得
 */
export const getCurrentTime = (): Date => {
  return new Date();
};

/**
 * ISO文字列から日付オブジェクトを安全に作成
 */
export const parseISOString = (isoString: string): Date | null => {
  try {
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

/**
 * メッセージ用のユニークIDを生成
 */
export const generateMessageId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `msg_${timestamp}_${randomStr}`;
};