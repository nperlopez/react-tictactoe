import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function SortingButton(props){
  return(
    <button onClick={props.onClick}>
        {props.text}
    </button>
  );
}
{/*Square es un 'controlled component'. Informa a su componente padre (Board) de cada click recibido y después recibe de él el cambio de estado*/}
{/* class Square extends React.Component {
  render() {
    return (
      <button
        className="square"
        onClick={() => this.props.onClick()}
      >
        {this.props.value}
      </button>
    );
  }
}
*/}

{/*Ahora se define Square como un 'function element' (antes era una clase) porque ya no tiene estado y solo necesita comunicarse con Board*/}
function Square(props){
  return(
    <button
      className={`${props.winnerClass} square`}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

{/*Board es el padre de Squares, almacena y actualiza el estado de cada uno de los cuadrados*/}
class Board extends React.Component {
  renderSquare(i) {
    const winnerClass = this.props.winnerSquares &&
      (this.props.winnerSquares[0] === i ||
      this.props.winnerSquares[1] === i ||
      this.props.winnerSquares[2] === i) ? 'winner' : '';

    return (
      <Square
        winnerClass={winnerClass}
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }
  renderBoard(row, col){
    const board = [];
    //cellCounter es el índice de cada cuadro y se tiene que incrementar en el segundo loop, ya que se ejecuta 3 veces por cada fila (3x3), es decir, 9 veces
    let cellCounter = 0;
    //Creamos las filas
    for(let i = 0; i < row; i++){
      const columns = [];
      //Creamos las celdas
      for(let j = 0; j < col; j++){
        columns.push(this.renderSquare(cellCounter++));
      }
      board.push(<div key={i} className="board-row">{columns}</div>);
    }
    return board;
  }

  render() {
    return (
      <div>
        {this.renderBoard(3, 3)}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      history:[{
        squares: Array(9).fill(null),
      }],
      currentStepNumber: 0,
      xIsNext: true,
      ascendentOrder: true,
    }
  }

  handleClick(i){
    const history = this.state.history.slice(0, this.state.currentStepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    {/*El siguiente if se encarga de inhabilitar handleClick cuando ya existe ganador (porque se evalúa de izda a dcha y es la primera condición la que devuelve true)*/}
    if(calculateWinner(squares).winner || squares[i]){
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';

    this.setState({
      history: history.concat([{
        squares: squares,
        position: getPosition(i),
        stepNumber: history.length,
      }]),
      currentStepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step){
    this.setState({
      currentStepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  changeOrder(asc){
    this.setState({
      ascendentOrder:!asc,
    });
  }

  renderSortingButton(asc){
    asc = this.state.ascendentOrder;
    let text;
    if(!asc){
      text = `Show in ascending order`;
    }else{
      text = `Show in descending order`;
    }
    return(
      <SortingButton
        onClick={() => this.changeOrder(asc)}
        text={text}
      />
    );
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.currentStepNumber];
    const { winner, winnerRow } = calculateWinner(current.squares);
    const asc = this.state.ascendentOrder;
    const moves = history.map((step, move) => {
      const currentPosition = step.position;
      const text = move ? `Go to move ${currentPosition}` : `Go to game start`;
      const myRegex = /start$/;

      if(move === this.state.currentStepNumber && !myRegex.test(text)){
        return(
          <li key={move}
              className="highlight-position"
          >
            <button
              onClick={() => this.jumpTo(move)}
            >
              {text}
            </button>
          </li>
        );
      }else{
        return(
          <li key={move}>
            <button
              onClick={() => this.jumpTo(move)}
            >
              {text}
            </button>
          </li>
        );
      }
    });

    if(!asc){
      moves.reverse();
    }

    let status;
    if(winner){
        status = `Winner: ${winner}`;
    }else{
      if(this.state.currentStepNumber === 9){
        status = `No winner, it's a draw`;
      }else{
          status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
      }
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winnerSquares={winnerRow}
            onClick={(i) => this.handleClick(i)}
            />
        </div>
        <div className="game-info">
          <div className="status">{status}</div>
          <div className="game-moves">
              <ol>{moves}</ol>
              <div className="game-sorter">{this.renderSortingButton()}</div>
          </div>
        </div>
      </div>
    );
  }
}

const getPosition = (move) =>{
  const positionMap = {
    0: 'row 1, col 1',
    1: 'row 1, col 2',
    2: 'row 1, col 3',
    3: 'row 2, col 1',
    4: 'row 2, col 2',
    5: 'row 2, col 3',
    6: 'row 3, col 1',
    7: 'row 3, col 2',
    8: 'row 3, col 3',
  };
  return positionMap[move]
};

function calculateWinner(squares){
  const lines = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6],
  ];
  for(let i = 0; i < lines.length; i++){
    const [a,b,c] = lines[i];
    {/*El siguiente if evalúa en cada turno todas las filas para ver si cada cuadrado de cada una está ocupado por el mismo jugador, cuando lo está, devuelve el jugador que gana*/}
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]){
      return {winner:squares[a], winnerRow: lines[i]};
    }
  }
  return {winner:null, winnerRow: null};
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
