import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { 
  Calculator, 
  CloudSun, 
  Timer, 
  Shuffle, 
  Compass, 
  BarChart, 
  Ruler, 
  Percent, 
  Clock, 
  ClipboardCheck,
  Dice1, 
  Dice3, 
  Dice5,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export default function Tools() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [calculatorValue, setCalculatorValue] = useState('0');
  const [timerValue, setTimerValue] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [randomResult, setRandomResult] = useState<string | null>(null);
  const [unitInput, setUnitInput] = useState('');
  const [unitFrom, setUnitFrom] = useState('cm');
  const [unitTo, setUnitTo] = useState('inches');
  const [unitResult, setUnitResult] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState('');
  const [tipPercent, setTipPercent] = useState('15');
  const [tipResult, setTipResult] = useState<string | null>(null);
  const [todoInput, setTodoInput] = useState('');
  const [todoList, setTodoList] = useState<{ id: number; text: string; completed: boolean }[]>([]);
  const [nextTodoId, setNextTodoId] = useState(1);
  
  const { data: weatherData } = useQuery({
    queryKey: ['/api/weather'],
  });

  // Calculator functions
  const handleCalculatorInput = (value: string) => {
    if (calculatorValue === '0' && !['/', '*', '-', '+', '.'].includes(value)) {
      setCalculatorValue(value);
    } else {
      setCalculatorValue(prev => prev + value);
    }
  };

  const calculateResult = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(calculatorValue);
      setCalculatorValue(result.toString());
    } catch (error) {
      setCalculatorValue('Error');
    }
  };

  const clearCalculator = () => {
    setCalculatorValue('0');
  };

  // Timer functions
  const startTimer = () => {
    if (timerValue > 0) {
      setTimerActive(true);
    }
  };

  const pauseTimer = () => {
    setTimerActive(false);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerValue(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Random generator function
  const generateRandom = (type: string) => {
    if (type === 'number') {
      const number = Math.floor(Math.random() * 100) + 1;
      setRandomResult(`Random number: ${number}`);
    } else if (type === 'yesno') {
      const answer = Math.random() > 0.5 ? 'Yes' : 'No';
      setRandomResult(`The answer is: ${answer}`);
    } else if (type === 'color') {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      setRandomResult(`Random color: ${color}`);
    } else if (type === 'dice') {
      const diceValue = Math.floor(Math.random() * 6) + 1;
      setRandomResult(`You rolled: ${diceValue}`);
    }
  };

  // Unit converter function
  const convertUnit = () => {
    if (!unitInput || isNaN(Number(unitInput))) {
      setUnitResult('Please enter a valid number');
      return;
    }

    const value = parseFloat(unitInput);
    let result: number;

    if (unitFrom === 'cm' && unitTo === 'inches') {
      result = value / 2.54;
      setUnitResult(`${value} cm = ${result.toFixed(2)} inches`);
    } else if (unitFrom === 'inches' && unitTo === 'cm') {
      result = value * 2.54;
      setUnitResult(`${value} inches = ${result.toFixed(2)} cm`);
    } else if (unitFrom === 'kg' && unitTo === 'lb') {
      result = value * 2.20462;
      setUnitResult(`${value} kg = ${result.toFixed(2)} lb`);
    } else if (unitFrom === 'lb' && unitTo === 'kg') {
      result = value / 2.20462;
      setUnitResult(`${value} lb = ${result.toFixed(2)} kg`);
    } else if (unitFrom === 'km' && unitTo === 'miles') {
      result = value * 0.621371;
      setUnitResult(`${value} km = ${result.toFixed(2)} miles`);
    } else if (unitFrom === 'miles' && unitTo === 'km') {
      result = value / 0.621371;
      setUnitResult(`${value} miles = ${result.toFixed(2)} km`);
    } else if (unitFrom === 'celsius' && unitTo === 'fahrenheit') {
      result = (value * 9/5) + 32;
      setUnitResult(`${value}°C = ${result.toFixed(2)}°F`);
    } else if (unitFrom === 'fahrenheit' && unitTo === 'celsius') {
      result = (value - 32) * 5/9;
      setUnitResult(`${value}°F = ${result.toFixed(2)}°C`);
    } else {
      setUnitResult(`${value} ${unitFrom} = ${value} ${unitTo}`);
    }
  };

  // Tip calculator function
  const calculateTip = () => {
    if (!tipAmount || isNaN(Number(tipAmount)) || !tipPercent || isNaN(Number(tipPercent))) {
      setTipResult('Please enter valid numbers');
      return;
    }

    const amount = parseFloat(tipAmount);
    const percent = parseFloat(tipPercent);
    
    const tipValue = amount * (percent / 100);
    const total = amount + tipValue;
    
    setTipResult(`Tip: $${tipValue.toFixed(2)}\nTotal: $${total.toFixed(2)}`);
  };

  // Todo list functions
  const addTodo = () => {
    if (todoInput.trim()) {
      setTodoList([...todoList, { id: nextTodoId, text: todoInput, completed: false }]);
      setNextTodoId(nextTodoId + 1);
      setTodoInput('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodoList(
      todoList.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodoList(todoList.filter(todo => todo.id !== id));
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Tools</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Useful utilities and handy calculators
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <Tabs defaultValue="calculator" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 sm:grid-cols-8">
                <TabsTrigger value="calculator" className="flex flex-col items-center gap-1 p-2 sm:p-1">
                  <Calculator className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Calculator</span>
                </TabsTrigger>
                <TabsTrigger value="weather" className="flex flex-col items-center gap-1 p-2 sm:p-1">
                  <CloudSun className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Weather</span>
                </TabsTrigger>
                <TabsTrigger value="timer" className="flex flex-col items-center gap-1 p-2 sm:p-1">
                  <Timer className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Timer</span>
                </TabsTrigger>
                <TabsTrigger value="random" className="flex flex-col items-center gap-1 p-2 sm:p-1">
                  <Shuffle className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Random</span>
                </TabsTrigger>
                <TabsTrigger value="unit" className="flex flex-col items-center gap-1 p-2 sm:p-1">
                  <Ruler className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Units</span>
                </TabsTrigger>
                <TabsTrigger value="tip" className="flex flex-col items-center gap-1 p-2 sm:p-1">
                  <Percent className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Tip</span>
                </TabsTrigger>
                <TabsTrigger value="todo" className="flex flex-col items-center gap-1 p-2 sm:p-1">
                  <ClipboardCheck className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Todo</span>
                </TabsTrigger>
                <TabsTrigger value="timezone" className="flex flex-col items-center gap-1 p-2 sm:p-1">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Time</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="calculator" className="p-2">
              <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-md mb-4 text-right text-xl font-mono">
                {calculatorValue}
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" onClick={clearCalculator} className="col-span-2">Clear</Button>
                <Button variant="outline" onClick={() => handleCalculatorInput('/')}>/</Button>
                <Button variant="outline" onClick={() => handleCalculatorInput('*')}>×</Button>
                
                <Button variant="outline" onClick={() => handleCalculatorInput('7')}>7</Button>
                <Button variant="outline" onClick={() => handleCalculatorInput('8')}>8</Button>
                <Button variant="outline" onClick={() => handleCalculatorInput('9')}>9</Button>
                <Button variant="outline" onClick={() => handleCalculatorInput('-')}>-</Button>
                
                <Button variant="outline" onClick={() => handleCalculatorInput('4')}>4</Button>
                <Button variant="outline" onClick={() => handleCalculatorInput('5')}>5</Button>
                <Button variant="outline" onClick={() => handleCalculatorInput('6')}>6</Button>
                <Button variant="outline" onClick={() => handleCalculatorInput('+')}>+</Button>
                
                <Button variant="outline" onClick={() => handleCalculatorInput('1')}>1</Button>
                <Button variant="outline" onClick={() => handleCalculatorInput('2')}>2</Button>
                <Button variant="outline" onClick={() => handleCalculatorInput('3')}>3</Button>
                <Button variant="outline" onClick={calculateResult} className="row-span-2">=</Button>
                
                <Button variant="outline" onClick={() => handleCalculatorInput('0')} className="col-span-2">0</Button>
                <Button variant="outline" onClick={() => handleCalculatorInput('.')}>.</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="weather">
              {weatherData ? (
                <div className="p-4 flex flex-col items-center">
                  <CloudSun className="h-16 w-16 text-amber-500 mb-4" />
                  <h3 className="text-2xl font-bold">{weatherData.temperature}°F</h3>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400">{weatherData.condition}</p>
                  <p className="text-md mt-2">{weatherData.location}</p>
                  <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md text-center">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Humidity</p>
                      <p className="text-lg font-medium">{weatherData.humidity}%</p>
                    </div>
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md text-center">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Wind</p>
                      <p className="text-lg font-medium">{weatherData.windSpeed} mph</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="p-4 flex flex-col items-center">
                  <CloudSun className="h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                  <p className="text-neutral-500 dark:text-neutral-400">Loading weather data...</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="timer">
              <div className="p-4 flex flex-col items-center">
                <div className="text-4xl font-mono mb-6">{formatTime(timerValue)}</div>
                {!timerActive ? (
                  <div className="space-y-4 w-full">
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" onClick={() => setTimerValue(prev => prev + 60)}>+1m</Button>
                      <Button variant="outline" onClick={() => setTimerValue(prev => prev + 300)}>+5m</Button>
                      <Button variant="outline" onClick={() => setTimerValue(prev => prev + 600)}>+10m</Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1" onClick={resetTimer}>Reset</Button>
                      <Button variant="default" className="flex-1" onClick={startTimer} disabled={timerValue === 0}>Start</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2 w-full">
                    <Button variant="outline" className="flex-1" onClick={resetTimer}>Reset</Button>
                    <Button variant="default" className="flex-1" onClick={pauseTimer}>Pause</Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="random">
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <Button variant="outline" onClick={() => generateRandom('number')}>
                    <Shuffle className="h-4 w-4 mr-2" />
                    Random Number (1-100)
                  </Button>
                  <Button variant="outline" onClick={() => generateRandom('yesno')}>
                    <Shuffle className="h-4 w-4 mr-2" />
                    Yes or No Decision
                  </Button>
                  <Button variant="outline" onClick={() => generateRandom('color')}>
                    <Shuffle className="h-4 w-4 mr-2" />
                    Random Color
                  </Button>
                  <Button variant="outline" onClick={() => generateRandom('dice')}>
                    <Dice3 className="h-4 w-4 mr-2" />
                    Roll a Dice
                  </Button>
                </div>
                
                {randomResult && (
                  <div className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-md text-center">
                    <p className="text-lg font-medium">{randomResult}</p>
                    {randomResult.includes('color') && (
                      <div 
                        className="mt-2 w-16 h-16 rounded-md mx-auto"
                        style={{ backgroundColor: randomResult.split(': ')[1] }}
                      ></div>
                    )}
                    {randomResult.includes('rolled') && (
                      <div className="mt-2 flex justify-center">
                        {randomResult.includes('1') && <Dice1 className="h-12 w-12" />}
                        {randomResult.includes('2') && <Dice1 className="h-12 w-12" />}
                        {randomResult.includes('3') && <Dice3 className="h-12 w-12" />}
                        {randomResult.includes('4') && <Dice3 className="h-12 w-12" />}
                        {randomResult.includes('5') && <Dice5 className="h-12 w-12" />}
                        {randomResult.includes('6') && <Dice5 className="h-12 w-12" />}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="unit">
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <Input 
                    type="number" 
                    value={unitInput} 
                    onChange={(e) => setUnitInput(e.target.value)}
                    placeholder="Enter value"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">From</label>
                    <select 
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800"
                      value={unitFrom}
                      onChange={(e) => setUnitFrom(e.target.value)}
                    >
                      <option value="cm">Centimeters (cm)</option>
                      <option value="inches">Inches (in)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="lb">Pounds (lb)</option>
                      <option value="km">Kilometers (km)</option>
                      <option value="miles">Miles (mi)</option>
                      <option value="celsius">Celsius (°C)</option>
                      <option value="fahrenheit">Fahrenheit (°F)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">To</label>
                    <select 
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800"
                      value={unitTo}
                      onChange={(e) => setUnitTo(e.target.value)}
                    >
                      <option value="cm">Centimeters (cm)</option>
                      <option value="inches">Inches (in)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="lb">Pounds (lb)</option>
                      <option value="km">Kilometers (km)</option>
                      <option value="miles">Miles (mi)</option>
                      <option value="celsius">Celsius (°C)</option>
                      <option value="fahrenheit">Fahrenheit (°F)</option>
                    </select>
                  </div>
                </div>
                
                <Button onClick={convertUnit} className="w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Convert
                </Button>
                
                {unitResult && (
                  <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md text-center font-medium">
                    {unitResult}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="tip">
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bill Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                    <Input 
                      type="number" 
                      value={tipAmount} 
                      onChange={(e) => setTipAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tip Percentage</label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      value={tipPercent} 
                      onChange={(e) => setTipPercent(e.target.value)}
                      placeholder="15"
                      className="pr-7"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2">%</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setTipPercent('15')}
                  >
                    15%
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setTipPercent('18')}
                  >
                    18%
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setTipPercent('20')}
                  >
                    20%
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setTipPercent('25')}
                  >
                    25%
                  </Button>
                </div>
                
                <Button onClick={calculateTip} className="w-full">
                  Calculate Tip
                </Button>
                
                {tipResult && (
                  <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md text-center whitespace-pre-line font-medium">
                    {tipResult}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="todo">
              <div className="p-4 space-y-4">
                <div className="flex space-x-2">
                  <Input 
                    value={todoInput} 
                    onChange={(e) => setTodoInput(e.target.value)}
                    placeholder="Add a new task"
                    onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                  />
                  <Button onClick={addTodo}>Add</Button>
                </div>
                
                <div className="space-y-2">
                  {todoList.length > 0 ? (
                    todoList.map(todo => (
                      <div 
                        key={todo.id} 
                        className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-md"
                      >
                        <div className="flex items-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "h-6 w-6 rounded-full mr-2",
                              todo.completed 
                                ? "bg-primary-500 text-white hover:bg-primary-600" 
                                : "border border-neutral-300 dark:border-neutral-600"
                            )}
                            onClick={() => toggleTodo(todo.id)}
                          >
                            {todo.completed && <Check className="h-4 w-4" />}
                          </Button>
                          <span className={todo.completed ? "line-through text-neutral-500" : ""}>
                            {todo.text}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600 h-8 w-8"
                          onClick={() => deleteTodo(todo.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">
                      No tasks added yet
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="timezone">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-4">World Time</h3>
                
                <div className="space-y-3">
                  {[
                    { city: "Local Time", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
                    { city: "New York", timezone: "America/New_York" },
                    { city: "London", timezone: "Europe/London" },
                    { city: "Tokyo", timezone: "Asia/Tokyo" },
                    { city: "Sydney", timezone: "Australia/Sydney" },
                  ].map(({ city, timezone }) => (
                    <div 
                      key={timezone}
                      className="flex justify-between items-center p-3 border border-neutral-200 dark:border-neutral-700 rounded-md"
                    >
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-primary-500" />
                        <div>
                          <div className="font-medium">{city}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">{timezone}</div>
                        </div>
                      </div>
                      <div className="text-lg font-mono">
                        {new Date().toLocaleTimeString('en-US', { timeZone: timezone })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Compass className="h-5 w-5 mr-2" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24"
                  onClick={() => setActiveTab('calculator')}
                >
                  <Calculator className="h-8 w-8 mb-2 text-primary-500" />
                  <span>Calculator</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24"
                  onClick={() => setActiveTab('weather')}
                >
                  <CloudSun className="h-8 w-8 mb-2 text-amber-500" />
                  <span>Weather</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24"
                  onClick={() => setActiveTab('timer')}
                >
                  <Timer className="h-8 w-8 mb-2 text-green-500" />
                  <span>Timer</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24"
                  onClick={() => setActiveTab('random')}
                >
                  <Shuffle className="h-8 w-8 mb-2 text-red-500" />
                  <span>Random</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Stats
              </CardTitle>
              <CardDescription>
                Your tool usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Calculator className="h-4 w-4 mr-2 text-primary-500" />
                    <span className="text-sm">Calculator</span>
                  </div>
                  <div className="text-sm font-medium">24 uses</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CloudSun className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm">Weather</span>
                  </div>
                  <div className="text-sm font-medium">18 uses</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Timer className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm">Timer</span>
                  </div>
                  <div className="text-sm font-medium">12 uses</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Shuffle className="h-4 w-4 mr-2 text-red-500" />
                    <span className="text-sm">Random</span>
                  </div>
                  <div className="text-sm font-medium">8 uses</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
