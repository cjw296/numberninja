import {ChangeEvent, JSX, useEffect, useRef, useState} from "react";
import {Box, Button, Center, Flex, Input, Text, HStack, Circle} from "@chakra-ui/react";

export default function App(): JSX.Element {
    const TOTAL_QUESTIONS = 5;
    const [questions, setQuestions] = useState<Array<{ num1: number; num2: number; operation: string; answer: number; difficulty: number }>>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [userInput, setUserInput] = useState<string>("");
    const [levelActive, setLevelActive] = useState<boolean>(false);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [responseTimes, setResponseTimes] = useState<number[]>([]);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [bestTime, setBestTime] = useState<number | null>(null);
    const [bestTimeReset, setBestTimeReset] = useState<boolean>(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const storedBestTime = localStorage.getItem("bestTime");
        if (storedBestTime) {
            setBestTime(parseFloat(storedBestTime));
        }
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (levelActive && startTime !== null) {
            timer = setInterval(() => {
                setElapsedTime(((Date.now() - startTime) / 1000));
            }, 100);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(timer);
    }, [levelActive, startTime]);

    useEffect(() => {
        if (responseTimes.length >= TOTAL_QUESTIONS) {
            const totalTime = responseTimes.reduce((a, b) => a + b, 0);
            if (!bestTimeReset && (bestTime === null || totalTime < bestTime)) {
                setBestTime(totalTime);
                localStorage.setItem("bestTime", totalTime.toFixed(2));
            }
            setShowResults(true);
            setLevelActive(false);
        }
    }, [responseTimes, bestTime, bestTimeReset]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [levelActive]);

    useEffect(() => {
        if (!levelActive && buttonRef.current) {
            buttonRef.current.focus();
        }
    }, [showResults, levelActive]);

    const calculateDifficulty = (n1: number, n2: number, op: string): number => {
        const numDigits = Math.max(n1.toString().length, n2.toString().length);
        const carriesOrBorrows = op === "+" ? (n1 % 10 + n2 % 10 >= 10 ? 1 : 0) : (n1 % 10 < n2 % 10 ? 1 : 0);
        const landmarkProximity = [10, 20, 50, 100].some(landmark => Math.abs(n1 + (op === "+" ? n2 : -n2) - landmark) <= 2) ? 1 : 0;
        return numDigits + carriesOrBorrows + landmarkProximity;
    };

    const generateQuestions = (): void => {
        const newQuestions = [];
        while (newQuestions.length < TOTAL_QUESTIONS) {
            const n1 = Math.floor(Math.random() * 20) + 1;
            const n2 = Math.floor(Math.random() * n1) + 1;
            const ops = ["+", "-"];
            const op = ops[Math.floor(Math.random() * ops.length)];
            const difficulty = calculateDifficulty(n1, n2, op);
            newQuestions.push({ num1: n1, num2: n2, operation: op, answer: op === "+" ? n1 + n2 : n1 - n2, difficulty });
        }
        setQuestions(newQuestions);
        setCurrentQuestionIndex(0);
        setStartTime(Date.now());
        setUserInput("");
        setResponseTimes([]);
        setLevelActive(true);
        setShowResults(false);
    };

    const handleAnswerSubmit = (): void => {
        if (parseInt(userInput) === questions[currentQuestionIndex].answer) {
            const elapsedTimeValue = startTime ? (Date.now() - startTime) / 1000 : 0;
            setResponseTimes(prev => [...prev, elapsedTimeValue]);
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setShowError(true);
        }
        setUserInput("");
    };

    const resetBestTime = (): void => {
        setBestTime(null);
        setBestTimeReset(true);
        localStorage.removeItem("bestTime");
    };

    return (
        <Center w="100vw" h="100vh" bg="gray.100">
            <Flex
                direction="column"
                align="center"
                justify="center"
                bg="white"
                p={8}
                rounded="lg"
                boxShadow="lg"
                w="90%"
                maxW="500px"
                minH="500px"
                position="relative"
            >
                {bestTime !== null && !bestTimeReset && (
                    <Text position="absolute" top={2} left={4} fontSize="lg" fontWeight="bold">
                        Best: {bestTime.toFixed(2)}s
                    </Text>
                )}
                {showResults ? (
                    <Box textAlign="center">
                        <Text fontSize="2xl">Total Time: {responseTimes.reduce((a, b) => a + b, 0).toFixed(2)}s</Text>
                        {bestTime !== null && !bestTimeReset && <Text fontSize="lg">Best Time: {bestTime.toFixed(2)}s</Text>}
                        <Button ref={buttonRef} mt={4} onClick={generateQuestions}>Play Again</Button>
                    </Box>
                ) : levelActive ? (
                    <Box textAlign="center">
                        <Text position="absolute" top={2} right={4} fontSize="lg" fontWeight="bold">
                            {elapsedTime.toFixed(1)}s
                        </Text>
                        <Text fontSize="2xl">
                            {questions[currentQuestionIndex]?.num1} {questions[currentQuestionIndex]?.operation} {questions[currentQuestionIndex]?.num2} = ?
                        </Text>
                        <Input
                            ref={inputRef}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAnswerSubmit()}
                            textAlign="center"
                            width="100px"
                            mt={4}
                        />
                        {showError && <Text color="red.500" mt={2}>✖ Incorrect!</Text>}
                        <HStack mt={4} spacing={2}>
                            {[...Array(TOTAL_QUESTIONS)].map((_, index) => (
                                <Circle key={index} size="20px" bg={index < responseTimes.length ? "green.500" : "gray.300"} />
                            ))}
                        </HStack>
                    </Box>
                ) : (
                    <Button ref={buttonRef} onClick={generateQuestions}>Play</Button>
                )}
                {showResults && (
                    <Button position="absolute" bottom={4} onClick={resetBestTime}>Reset Best Time</Button>
                )}
            </Flex>
        </Center>
    );
}
