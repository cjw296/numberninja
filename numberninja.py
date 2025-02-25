import pygame
import random
import time

# Initialize Pygame
pygame.init()

# Constants
WIDTH, HEIGHT = 800, 600
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
FONT = pygame.font.Font(None, 50)

# Setup screen
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Number Ninja")


def generate_question():
    while True:
        num1, num2 = random.randint(1, 20), random.randint(1, 20)
        operation = random.choice(["+", "-"])
        answer = eval(f"{num1} {operation} {num2}")
        if answer >= 0:  # Ensure positive answers only
            return num1, num2, operation, answer


# Game variables
score = 0
question_start_time = time.time()
response_times = []
user_input = ""
num1, num2, operation, answer = generate_question()
show_red_cross = False
red_cross_timer = 0
running = True

while running:
    screen.fill(WHITE)

    # Display question
    question_text = FONT.render(f"{num1} {operation} {num2} = ?", True, BLACK)
    screen.blit(question_text, (WIDTH // 2 - 100, HEIGHT // 3))

    # Display user input
    input_text = FONT.render(user_input, True, BLACK)
    screen.blit(input_text, (WIDTH // 2 - 50, HEIGHT // 2))

    # Show red cross if incorrect answer was given
    if show_red_cross:
        pygame.draw.line(screen, RED, (WIDTH // 2 - 20, HEIGHT // 2 + 50),
                         (WIDTH // 2 + 20, HEIGHT // 2 + 90), 5)
        pygame.draw.line(screen, RED, (WIDTH // 2 + 20, HEIGHT // 2 + 50),
                         (WIDTH // 2 - 20, HEIGHT // 2 + 90), 5)
        if time.time() - red_cross_timer > 1:
            show_red_cross = False  # Hide after 1 second

    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_RETURN:
                if user_input.isdigit() or (
                        user_input.startswith('-') and user_input[1:].isdigit()):
                    if int(user_input) == answer:
                        elapsed_time = time.time() - question_start_time
                        response_times.append(elapsed_time)
                        score += max(10 - int(elapsed_time), 1)  # Faster responses earn more points
                        num1, num2, operation, answer = generate_question()
                        question_start_time = time.time()
                    else:
                        show_red_cross = True
                        red_cross_timer = time.time()
                    user_input = ""
            elif event.key == pygame.K_BACKSPACE:
                user_input = user_input[:-1]
            elif event.unicode.isdigit() or event.unicode == "-":
                user_input += event.unicode

    # Display score
    score_text = FONT.render(f"Score: {score}", True, BLACK)
    screen.blit(score_text, (10, 10))

    # Display average response time
    if response_times:
        avg_time = sum(response_times) / len(response_times)
        time_text = FONT.render(f"Avg Time: {avg_time:.2f}s", True, BLACK)
        screen.blit(time_text, (10, 50))

    pygame.display.flip()

pygame.quit()
