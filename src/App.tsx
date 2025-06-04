import React from 'react';
import ChatContainer from './components/ChatContainer/ChatContainer';

// メインスタイルファイルをインポート
import './styles/index.scss';

function App() {
  return (
    <div className="App">
      <ChatContainer
        title="チャットボット"
        placeholder="何でもお気軽にお話しください..."
      />
    </div>
  );
}

export default App;