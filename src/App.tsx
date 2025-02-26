import {ChangeEvent, JSX, KeyboardEvent, useEffect, useRef, useState} from "react";
import {Box, Button, Center, Flex, Input, Text} from "@chakra-ui/react";

export default function App(): JSX.Element {
    const TOTAL_QUESTIONS = 5;
    const [num1, setNum1] = useState<number>(0);
    const [num2, setNum2] = useState<number>(0);
    const [operation, setOperation] = useState<string>("+");
    const [answer, setAnswer] = useState<number>(0);
    const [userInput, setUserInput] = useState<string>("");
    const [score, setScore] = useState<number>(0);
    const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
    const [levelActive, setLevelActive] = useState<boolean>(false);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [responseTimes, setResponseTimes] = useState<number[]>([]);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);

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
        if (levelActive) {
            generateQuestion();
        }
    }, [levelActive]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [levelActive]);

    const generateQuestion = (): void => {
        setShowError(false);
        const n1 = Math.floor(Math.random() * 20) + 1;
        const n2 = Math.floor(Math.random() * n1) + 1;
        const ops = ["+", "-"];
        const op = ops[Math.floor(Math.random() * ops.length)];
        setNum1(n1);
        setNum2(n2);
        setOperation(op);
        setAnswer(op === "+" ? n1 + n2 : n1 - n2);
        setStartTime(Date.now());
    };

    const handleAnswerSubmit = (): void => {
        if (parseInt(userInput) === answer) {
            const elapsedTimeValue = startTime ? (Date.now() - startTime) / 1000 : 0;
            setResponseTimes([...responseTimes, elapsedTimeValue]);
            setScore(score + Math.max(10 - Math.floor(elapsedTimeValue), 1));
            setQuestionsAnswered(questionsAnswered + 1);
            setShowError(false);
            if (questionsAnswered + 1 >= TOTAL_QUESTIONS) {
                setLevelActive(false);
                setShowResults(true);
            } else {
                generateQuestion();
            }
        } else {
            setShowError(true);
        }
        setUserInput("");
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setUserInput(e.target.value);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") {
            handleAnswerSubmit();
        }
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
                {levelActive && (
                    <Text position="absolute" top={2} right={4} fontSize="lg" fontWeight="bold">
                        {elapsedTime.toFixed(1)}s
                    </Text>
                )}
                {showResults ? (
                    <Box textAlign="center">
                        <Text fontSize="2xl">Final Score: {score}</Text>
                        {responseTimes.length > 0 && (
                            <Text fontSize="lg">
                                Avg Time: {(
                                    responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
                                ).toFixed(2)}
                                s
                            </Text>
                        )}
                        <Button
                            mt={4}
                            onClick={() => {
                                setShowResults(false);
                                setScore(0);
                                setQuestionsAnswered(0);
                                setResponseTimes([]);
                            }}
                        >
                            Play Again
                        </Button>
                    </Box>
                ) : levelActive ? (
                    <Box textAlign="center">
                        <Text fontSize="2xl">
                            {num1} {operation} {num2} = ?
                        </Text>
                        <Input
                            ref={inputRef}
                            value={userInput}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            textAlign="center"
                            width="100px"
                            mt={4}
                        />
                        {showError && <Text color="red.500" mt={2}>✖ Incorrect!</Text>}
                    </Box>
                ) : (
                    <Button onClick={() => setLevelActive(true)}>Play</Button>
                )}
            </Flex>
        </Center>
    );
}
