import React, { useState, useEffect, useRef } from 'react';

// propsの型を定義
interface TypewriterProps {
    text: string;                           // ストリーミングで伸びていく全文
    speed?: number;                         // 1文字あたりの速度(ms)
    scrollToBottom?: (smooth?: boolean) => void;
    onDone?: () => void;//タイプライター式表示が終わったことを知らせる
}

const TypewriterText: React.FC<TypewriterProps> = ({
    text = '',
    speed = 50,
    scrollToBottom,
    onDone,
}) => {
    const [displayText, setDisplayText] = useState('');
    const textRef = useRef(text);          // 常に最新の text を保持
    const doneRef = useRef(false);

    // text が更新されたら ref にだけ反映（エフェクトは再生成しない）
    useEffect(() => {
        textRef.current = text;
        doneRef.current = false;
    }, [text]);

    useEffect(() => {
        // ここでは interval を一度だけ作る（speed が変わったら作り直し）
        const intervalId = setInterval(() => {
            setDisplayText(prev => {
                const target = textRef.current;   // 現時点の全文

                if (prev.length >= target.length) {
                    if(!doneRef.current && target.length > 0){
                        doneRef.current = true;
                        onDone?.();
                    }
                    return prev;
                }

                // 「今の長さ＋1文字」分を 先頭から slice する
                const nextLength = prev.length + 1;
                const nextText = target.slice(0, nextLength);

                if (scrollToBottom) {
                    scrollToBottom(true);
                }

                return nextText;
            });
        }, speed);

        return () => clearInterval(intervalId);
    }, [speed, scrollToBottom]);  // ★ text は依存に入れないのがポイント

    return <>{displayText}</>;
};

export default TypewriterText;
