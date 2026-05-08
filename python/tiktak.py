import math

def print_board(board):
    print("\n")
    print(f" {board[0]} | {board[1]} | {board[2]} ")
    print("---+---+---")
    print(f" {board[3]} | {board[4]} | {board[5]} ")
    print("---+---+---")
    print(f" {board[6]} | {board[7]} | {board[8]} ")
    print("\n")


def check_winner(board, player):
    win_positions = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ]
    return any(board[a] == board[b] == board[c] == player for a,b,c in win_positions)


def is_draw(board):
    return " " not in board


# 🔥 Minimax Algorithm
def minimax(board, depth, is_ai):
    if check_winner(board, "O"):
        return 1
    if check_winner(board, "X"):
        return -1
    if is_draw(board):
        return 0

    if is_ai:
        best_score = -math.inf
        for i in range(9):
            if board[i] == " ":
                board[i] = "O"
                score = minimax(board, depth + 1, False)
                board[i] = " "
                best_score = max(score, best_score)
        return best_score
    else:
        best_score = math.inf
        for i in range(9):
            if board[i] == " ":
                board[i] = "X"
                score = minimax(board, depth + 1, True)
                board[i] = " "
                best_score = min(score, best_score)
        return best_score


def ai_move(board):
    best_score = -math.inf
    move = -1
    for i in range(9):
        if board[i] == " ":
            board[i] = "O"
            score = minimax(board, 0, False)
            board[i] = " "
            if score > best_score:
                best_score = score
                move = i
    return move


def tic_tac_toe():
    board = [" " for _ in range(9)]
    print("You are X | AI is O")
    print("Positions:")
    print(" 1 | 2 | 3 ")
    print("---+---+---")
    print(" 4 | 5 | 6 ")
    print("---+---+---")
    print(" 7 | 8 | 9 ")

    while True:
        print_board(board)

        # Player move
        try:
            choice = int(input("Choose your position (1-9): ")) - 1
            if choice < 0 or choice > 8 or board[choice] != " ":
                print("Invalid move! Try again.")
                continue
        except ValueError:
            print("Enter a number!")
            continue

        board[choice] = "X"

        if check_winner(board, "X"):
            print_board(board)
            print("🎉 You win!")
            break

        if is_draw(board):
            print_board(board)
            print("It's a draw!")
            break

        # AI move
        print("AI is thinking...")
        move = ai_move(board)
        board[move] = "O"

        if check_winner(board, "O"):
            print_board(board)
            print("🤖 AI wins!")
            break

        if is_draw(board):
            print_board(board)
            print("It's a draw!")
            break


# Run game
tic_tac_toe()
