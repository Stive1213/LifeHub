import { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Wrench, Calculator, Cloud, Clock, Shuffle, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';

export default function QuickToolsWidget() {
  const [activeToolDialog, setActiveToolDialog] = useState<string | null>(null);
  const [calculatorValue, setCalculatorValue] = useState('0');
  const [timerValue, setTimerValue] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [randomResult, setRandomResult] = useState<string | null>(null);
  
  const { data: weatherData } = useQuery({
    queryKey: ['/api/weather'],
  });

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timerValue > 0) {
      interval = setInterval(() => {
        setTimerValue(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timerActive, timerValue]);

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
    }
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

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
        <CardTitle className="font-semibold text-neutral-900 dark:text-white flex items-center">
          <Wrench className="h-5 w-5 mr-2 text-primary-500" />
          Quick Tools
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Customize Tools</DropdownMenuItem>
            <DropdownMenuItem>Full Tools View</DropdownMenuItem>
            <DropdownMenuItem>Tool Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-4 rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            onClick={() => setActiveToolDialog('calculator')}
          >
            <Calculator className="h-5 w-5 text-primary-500 mb-2" />
            <span className="text-sm text-neutral-800 dark:text-neutral-200">Calculator</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-4 rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            onClick={() => setActiveToolDialog('weather')}
          >
            <Cloud className="h-5 w-5 text-amber-500 mb-2" />
            <span className="text-sm text-neutral-800 dark:text-neutral-200">Weather</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-4 rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            onClick={() => setActiveToolDialog('timer')}
          >
            <Clock className="h-5 w-5 text-green-500 mb-2" />
            <span className="text-sm text-neutral-800 dark:text-neutral-200">Timer</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-4 rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            onClick={() => setActiveToolDialog('random')}
          >
            <Shuffle className="h-5 w-5 text-red-500 mb-2" />
            <span className="text-sm text-neutral-800 dark:text-neutral-200">Random</span>
          </Button>
        </div>

        {weatherData && (
          <div className="mb-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-md text-neutral-900 dark:text-white flex items-center">
            <Cloud className="h-5 w-5 text-amber-500 mr-2" />
            <div>
              <div className="flex items-end">
                <span className="text-lg font-semibold">{weatherData.temperature}°F</span>
                <span className="text-xs ml-1 text-neutral-500 dark:text-neutral-400">{weatherData.condition}</span>
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">{weatherData.location}</div>
            </div>
          </div>
        )}

        <Button 
          variant="link" 
          className="w-full mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add More Tools
        </Button>
      </CardContent>

      {/* Calculator Dialog */}
      <Dialog open={activeToolDialog === 'calculator'} onOpenChange={(open) => !open && setActiveToolDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calculator</DialogTitle>
          </DialogHeader>
          <div className="p-2">
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Weather Dialog */}
      <Dialog open={activeToolDialog === 'weather'} onOpenChange={(open) => !open && setActiveToolDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weather</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex flex-col items-center">
            {weatherData ? (
              <>
                <Cloud className="h-16 w-16 text-amber-500 mb-4" />
                <h3 className="text-2xl font-bold">{weatherData.temperature}°F</h3>
                <p className="text-lg text-neutral-600 dark:text-neutral-400">{weatherData.condition}</p>
                <p className="text-md mt-2">{weatherData.location}</p>
                <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Humidity</p>
                    <p className="text-lg font-medium">{weatherData.humidity}%</p>
                  </div>
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Wind</p>
                    <p className="text-lg font-medium">{weatherData.windSpeed} mph</p>
                  </div>
                </div>
              </>
            ) : (
              <p>Loading weather data...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Timer Dialog */}
      <Dialog open={activeToolDialog === 'timer'} onOpenChange={(open) => !open && setActiveToolDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Timer</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>

      {/* Random Dialog */}
      <Dialog open={activeToolDialog === 'random'} onOpenChange={(open) => !open && setActiveToolDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Random Generator</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-3 mb-4">
              <Button variant="outline" onClick={() => generateRandom('number')}>Random Number (1-100)</Button>
              <Button variant="outline" onClick={() => generateRandom('yesno')}>Yes or No Decision</Button>
              <Button variant="outline" onClick={() => generateRandom('color')}>Random Color</Button>
            </div>
            
            {randomResult && (
              <div className="mt-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-md text-center">
                <p className="text-lg font-medium">{randomResult}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
