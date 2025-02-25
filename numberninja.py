import pygame
import random
import time

# Initialize Pygame
pygame.init()

# Constants
WIDTH, HEIGHT = 800, 600
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
FONT = pygame.font.Font(None, 50)

# Setup screen
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Addition & Subtraction Game")

# Game variables
score = 0
question_start_time = time.time()
user_input = ""
num1, num2 = random.randint(1, 20), random.randint(1, 20)
operation = random.choice(["+", "-"])
answer = eval(f"{num1} {operation} {num2}")

running = True
while running:
    screen.fill(WHITE)

    # Display question
    question_text = FONT.render(f"{num1} {operation} {num2} = ?", True, BLACK)
    screen.blit(question_text, (WIDTH // 2 - 100, HEIGHT // 3))

    # Display user input
    input_text = FONT.render(user_input, True, BLACK)
    screen.blit(input_text, (WIDTH // 2 - 50, HEIGHT // 2))

    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_RETURN:
                print(f"User entered: {user_input}, Correct answer: {answer}")
                if user_input.isdigit() or (
                        user_input.startswith('-') and user_input[1:].isdigit()):
                    if int(user_input) == answer:
                        elapsed_time = time.time() - question_start_time
                        score += max(10 - int(elapsed_time), 1)  # Faster responses earn more points
                        num1, num2 = random.randint(1, 20), random.randint(1, 20)
                        operation = random.choice(["+", "-"])
                        answer = eval(f"{num1} {operation} {num2}")
                        question_start_time = time.time()
                    user_input = ""
            elif event.key == pygame.K_BACKSPACE:
                user_input = user_input[:-1]
            elif event.unicode.isdigit() or event.unicode == "-":
                user_input += event.unicode

    # Display score
    score_text = FONT.render(f"Score: {score}", True, BLACK)
    screen.blit(score_text, (10, 10))

    pygame.display.flip()

pygame.quit()
