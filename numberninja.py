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
BUTTON_FONT = pygame.font.Font(None, 40)

# Setup screen
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Number Ninja")


def generate_question():
    num1 = random.randint(1, 20)
    num2 = random.randint(1, num1)
    operation = random.choice(["+", "-"])
    answer = eval(f"{num1} {operation} {num2}")
    return num1, num2, operation, answer


def draw_button(text, x, y, w, h):
    pygame.draw.rect(screen, BLACK, (x, y, w, h), 2)
    button_text = BUTTON_FONT.render(text, True, BLACK)
    screen.blit(button_text, (x + 10, y + 10))
    return pygame.Rect(x, y, w, h)


# Game variables
score = 0
question_start_time = 0
response_times = []
user_input = ""
time_elapsed = 0
num1 = num2 = operation = answer = None
show_red_cross = False
red_cross_timer = 0
running = True
level_active = False
questions_answered = 0
TOTAL_QUESTIONS = 5
show_results = False

while running:
    screen.fill(WHITE)

    if show_results:
        # Display final score and average time
        result_text = FONT.render(f"Final Score: {score}", True, BLACK)
        screen.blit(result_text, (WIDTH // 2 - 100, HEIGHT // 3))
        if response_times:
            avg_time = sum(response_times) / len(response_times)
            avg_time_text = FONT.render(f"Avg Time: {avg_time:.2f}s", True, BLACK)
            screen.blit(avg_time_text, (WIDTH // 2 - 100, HEIGHT // 3 + 50))
        play_again_button = draw_button("Play Again", WIDTH // 2 - 75, HEIGHT // 2, 150, 50)
    elif not level_active:
        play_button = draw_button("Play", WIDTH // 2 - 50, HEIGHT // 3, 100, 50)
    else:
        # Update the elapsed time
        time_elapsed = time.time() - question_start_time

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

        # Display score
        score_text = FONT.render(f"Score: {score}", True, BLACK)
        screen.blit(score_text, (10, 10))

        # Display average response time
        if response_times:
            avg_time = sum(response_times) / len(response_times)
            time_text = FONT.render(f"Avg Time: {avg_time:.2f}s", True, BLACK)
            screen.blit(time_text, (10, 50))

        # Display current thinking time in top-right
        thinking_time_text = FONT.render(f"Time: {time_elapsed:.1f}s", True, BLACK)
        screen.blit(thinking_time_text, (WIDTH - 160, 10))

    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if not level_active and not show_results:
                if play_button.collidepoint(event.pos):
                    level_active = True
                    questions_answered = 0
                    score = 0
                    response_times = []
                    num1, num2, operation, answer = generate_question()
                    question_start_time = time.time()
            elif show_results:
                if play_again_button.collidepoint(event.pos):
                    show_results = False
        elif event.type == pygame.KEYDOWN and level_active:
            if event.key == pygame.K_RETURN:
                if user_input.isdigit() or (
                        user_input.startswith('-') and user_input[1:].isdigit()):
                    if int(user_input) == answer:
                        elapsed_time = time.time() - question_start_time
                        response_times.append(elapsed_time)
                        score += max(10 - int(elapsed_time), 1)  # Faster responses earn more points
                        questions_answered += 1
                        if questions_answered >= TOTAL_QUESTIONS:
                            level_active = False
                            show_results = True
                        else:
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

    pygame.display.flip()

pygame.quit()
