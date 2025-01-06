import { useState } from "react";

// SquareClass
function Square({ SquareClass = "square", value, handleClick }) {
  return (
    <button className={SquareClass} onClick={handleClick}>
      {value}
    </button>
  );
}

function Status({ status }) {
  return <div className="status">{status}</div>;
}

// 使用onPlay来告知父组件，有状态需要更新 因为使用的prop来自父组件，需要回到父组件真的进行更新
function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    // 创建数组的浅拷贝 而不是直接修改数组 不可变性状态管理
    const nextSquares = squares.slice();

    nextSquares[i] = xIsNext ? "x" : "o";
    // 点击发生时，告知父组件更新状态
    // 这里把更新的参数传了回去
    onPlay(nextSquares);
  }

  // 判断是否赢了
  // 找到赢了的旗子
  // 把旗子状态变成红色突出显示

  // 平局：如果旗子都占满了 但是依然没有赢家 显示平局

  // Status Management
  const winner = calculateWinner(squares)?.winnerCalculate;
  let winnerStatus;

  let WinnerLines = [];
  console.log(squares);
  // 平手

  if (winner) {
    winnerStatus = "Winner:" + winner;
    WinnerLines = calculateWinner(squares).WinnerLine;
  } else if (
    squares.every(
      (item) => item !== null && item !== undefined && item !== ""
    ) &&
    !winner
  ) {
    winnerStatus = "EVEN";
  } else {
    winnerStatus = "Next Move:" + (xIsNext ? "x" : "o");
  }

  // 隐式返回和显式返回
  const grid = Array.from({ length: 3 }, (_, rowIndex) => (
    <div key={rowIndex} className="board-row">
      {Array.from({ length: 3 }, (_, colIndex) => {
        let SquareClass = "square";
        const index = rowIndex * 3 + colIndex;
        if (WinnerLines.length !== 0) {
          if (WinnerLines.includes(index)) {
            SquareClass = "square winner";
          }
        }
        return (
          <Square
            key={index}
            SquareClass={SquareClass}
            value={squares[index]}
            handleClick={() => handleClick(index)}
          />
        );
      })}
    </div>
  ));
  // const grid = [];
  // for (let i = 0; i < 3; i++) {
  //   const row = [];
  //   for (let j = 0; j < 3; j++) {
  //     // 把内容看成组件 变量也可以看成组件集合
  //     // 不能使用全局变量人工计数index，会导致渲染错误
  //     let index = i * 3 + j;
  //     row.push(
  //       <Square value={squares[index]} handleClick={() => handleClick(index)} />
  //     );
  //   }
  //   grid.push(<div className="board-row">{row}</div>);
  // }

  /* 如果想要传递prop 需要父子的对应 同时对于函数来说 同时要看到父子的输入
        ，像这里父的输入其实是点击 但是不影响后面 所以穿进去后边变成具体的函数调用
        这个具体调用再传给子 也就是把这个带参数的方程传下去 */

  return (
    <>
      <Status status={winnerStatus} />
      {grid}
    </>
  );
}

export default function Game() {
  // 用prop来控制board渲染

  // 通过更新history数组等方法重新来渲染

  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isUp, setIsUp] = useState(true);
  const currentSquares = history[currentMove];
  const xIsNext = currentMove % 2 === 0;

  function handlePlay(nextSquares) {
    // 时间旅行的实现：渲染当前选定的盘面即可 xo交由奇偶判断
    // 因为点击触发jumpto更新渲染，currentmove变了，所以board重新渲染回来的时候可以更新盘面
    const newHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(newHistory);
    // 因为更新是异步的，所以不能默认一起更新的时候顺序是从上往下的，也就是说要直接用新的数组的‘锚’来更新其他的变量
    setCurrentMove(newHistory.length - 1);
  }

  function jumpTo(targetMove) {
    // 获得对应盘面 jumpto里不渲染之后的事情
    setCurrentMove(targetMove);
  }

  function sortHistory() {
    // 回调函数可以保证同步
    setIsUp((isUp) => !isUp);
  }
  // 确定排序顺序 默认是升序
  // 对序号的浅拷贝排序
  const sortedSquares = [...history]
    .map((squares, move) => ({ squares, move }))
    .sort((a, b) => (isUp ? a.move - b.move : b.move - a.move));

  // 渲染排序后的数组

  const moves = sortedSquares.map((squares, index) => {
    let description;

    if (squares.move > 0 && squares.move != history.length - 1) {
      description = "move to #" + squares.move;
    } else if (squares.move === history.length - 1) {
      description = "You are at #" + squares.move;
      return (
        <li key={squares.move}>
          <div>{description}</div>
        </li>
      );
    } else {
      description = "game start";
    }
    return (
      <li key={squares.move}>
        <button onClick={() => jumpTo(squares.move)}>{description}</button>
      </li>
    );
  });

  // 拿到每一步对应的数组再渲染li
  // let description;
  // const moves = history.map((squares, move) => {
  //   if (move > 0 && move != history.length - 1) {
  //     description = "move to #" + move;
  //   } else if (move === history.length - 1) {
  //     description = "You are at #" + move;
  //     return (
  //       <li key={move}>
  //         <div>{description}</div>
  //       </li>
  //     );
  //   } else {
  //     description = "game start";
  //   }
  //   return (
  //     <li key={move}>
  //       <button onClick={() => jumpTo(move)}>{description}</button>
  //     </li>
  //   );
  // });

  return (
    <div className="game">
      <div className="game-board">
        <button onClick={() => sortHistory()}>{isUp ? "up" : "down"}</button>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winnerCalculate: squares[a], WinnerLine: lines[i] };
    }
  }
  return null;
}
