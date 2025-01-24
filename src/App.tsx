import React, { useState, useEffect, useRef } from 'react';
import { Divide, Minus, Plus, X, RotateCcw, Square, Percent, Power, FunctionSquare as FunctionIcon, Delete, ChevronUp, ChevronDown } from 'lucide-react';

function App() {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number>(0);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [isNewNumber, setIsNewNumber] = useState(true);
  const [expression, setExpression] = useState('');
  const [isGraphMode, setIsGraphMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isGraphMode) {
      drawGraph();
    }
  }, [isGraphMode, expression]);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#666';
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Plot function if expression exists
    if (expression) {
      try {
        ctx.beginPath();
        ctx.strokeStyle = '#4CAF50';
        for (let x = -10; x <= 10; x += 0.1) {
          const y = evaluateExpression(expression, x);
          const canvasX = (x + 10) * (canvas.width / 20);
          const canvasY = canvas.height / 2 - y * (canvas.height / 20);
          
          if (x === -10) {
            ctx.moveTo(canvasX, canvasY);
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        }
        ctx.stroke();
      } catch (error) {
        console.error('Error plotting function:', error);
      }
    }
  };

  const evaluateExpression = (expr: string, x: number): number => {
    // Replace x with actual value and evaluate
    const safeExpr = expr.replace(/x/g, x.toString());
    try {
      return Function('"use strict";return (' + safeExpr + ')')();
    } catch {
      return 0;
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setIsNewNumber(true);
    setExpression('');
  };

  const handleNumber = (num: string) => {
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (isNewNumber) {
      setDisplay('0.');
      setIsNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (op: string) => {
    const current = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setPreviousValue(result);
      setDisplay(result.toString());
    }
    
    setOperation(op);
    setIsNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : NaN;
      case 'x²': return Math.pow(a, 2);
      case 'xʸ': return Math.pow(a, b);
      case '%': return (a * b) / 100;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(result.toString());
      setPreviousValue(null);
      setOperation(null);
      setIsNewNumber(true);
    }
  };

  const handleSpecialFunction = (func: string) => {
    const current = parseFloat(display);
    let result: number;

    switch (func) {
      case 'sqrt':
        result = Math.sqrt(current);
        break;
      case 'sin':
        result = Math.sin(current * Math.PI / 180);
        break;
      case 'cos':
        result = Math.cos(current * Math.PI / 180);
        break;
      case 'tan':
        result = Math.tan(current * Math.PI / 180);
        break;
      case 'log':
        result = Math.log10(current);
        break;
      case 'ln':
        result = Math.log(current);
        break;
      default:
        return;
    }

    setDisplay(result.toString());
    setIsNewNumber(true);
  };

  const handleGraphMode = () => {
    setIsGraphMode(!isGraphMode);
    if (!isGraphMode) {
      setExpression('x');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Display Area */}
        <div className="bg-gray-200 p-4 rounded-lg mb-4">
          {isGraphMode ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-gray-700">f(x) =</span>
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  className="flex-1 p-1 border rounded"
                  placeholder="Enter function (e.g., x^2)"
                />
              </div>
              <canvas
                ref={canvasRef}
                width={300}
                height={200}
                className="w-full bg-white rounded"
              />
            </div>
          ) : (
            <div className="text-right text-3xl font-mono text-gray-800 h-12 overflow-hidden">
              {display}
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <button
          onClick={handleGraphMode}
          className="w-full mb-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <span>{isGraphMode ? 'Calculator Mode' : 'Graph Mode'}</span>
          {isGraphMode ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>

        {/* Scientific Functions */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button onClick={() => handleSpecialFunction('sin')} 
                  className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600">
            sin
          </button>
          <button onClick={() => handleSpecialFunction('cos')} 
                  className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600">
            cos
          </button>
          <button onClick={() => handleSpecialFunction('tan')} 
                  className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600">
            tan
          </button>
          <button onClick={() => handleSpecialFunction('sqrt')} 
                  className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600">
            √
          </button>
          <button onClick={() => handleSpecialFunction('log')} 
                  className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600">
            log
          </button>
          <button onClick={() => handleSpecialFunction('ln')} 
                  className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600">
            ln
          </button>
          <button onClick={() => handleOperator('xʸ')} 
                  className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600">
            xʸ
          </button>
          <button onClick={() => handleOperator('x²')} 
                  className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600">
            x²
          </button>
        </div>

        {/* Main Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {/* First Row */}
          <button onClick={clearDisplay} 
                  className="bg-red-500 text-white p-4 rounded hover:bg-red-600 flex items-center justify-center">
            <RotateCcw size={20} />
          </button>
          <button onClick={() => handleOperator('(')} 
                  className="bg-gray-700 text-white p-4 rounded hover:bg-gray-600">
            (
          </button>
          <button onClick={() => handleOperator(')')} 
                  className="bg-gray-700 text-white p-4 rounded hover:bg-gray-600">
            )
          </button>
          <button onClick={() => handleOperator('÷')} 
                  className="bg-gray-700 text-white p-4 rounded hover:bg-gray-600">
            <Divide size={20} />
          </button>

          {/* Number Pad and Operations */}
          {[7, 8, 9].map(num => (
            <button key={num} onClick={() => handleNumber(num.toString())}
                    className="bg-gray-600 text-white p-4 rounded hover:bg-gray-500">
              {num}
            </button>
          ))}
          <button onClick={() => handleOperator('×')} 
                  className="bg-gray-700 text-white p-4 rounded hover:bg-gray-600">
            <X size={20} />
          </button>

          {[4, 5, 6].map(num => (
            <button key={num} onClick={() => handleNumber(num.toString())}
                    className="bg-gray-600 text-white p-4 rounded hover:bg-gray-500">
              {num}
            </button>
          ))}
          <button onClick={() => handleOperator('-')} 
                  className="bg-gray-700 text-white p-4 rounded hover:bg-gray-600">
            <Minus size={20} />
          </button>

          {[1, 2, 3].map(num => (
            <button key={num} onClick={() => handleNumber(num.toString())}
                    className="bg-gray-600 text-white p-4 rounded hover:bg-gray-500">
              {num}
            </button>
          ))}
          <button onClick={() => handleOperator('+')} 
                  className="bg-gray-700 text-white p-4 rounded hover:bg-gray-600">
            <Plus size={20} />
          </button>

          {/* Last Row */}
          <button onClick={() => handleNumber('0')} 
                  className="bg-gray-600 text-white p-4 rounded hover:bg-gray-500 col-span-2">
            0
          </button>
          <button onClick={handleDecimal} 
                  className="bg-gray-600 text-white p-4 rounded hover:bg-gray-500">
            .
          </button>
          <button onClick={handleEquals} 
                  className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600">
            =
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;