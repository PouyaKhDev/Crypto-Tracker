SESSION_NAME="project"

# If session already exists, just attach to it
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  echo "Session '$SESSION_NAME' already exists. Attaching..."
  tmux attach -t "$SESSION_NAME"
  exit 0
fi

# Create a new detached session with window 1 named 'code'
tmux new-session -d -s "$SESSION_NAME" -n code

### Window 1: code (4 panes in a 2x2 grid)
# At this point: one pane: project:code.0

# Step 1: split window 1 vertically (left/right)
tmux split-window -v -t "$SESSION_NAME:code"
# Now panes: 0 (left), 1 (right)

# Step 2: split the left pane horizontally (top/bottom)
tmux split-window -h -t "$SESSION_NAME:code.0"
# Now panes: 0 (top-left), 2 (bottom-left), 1 (right)

# Step 3: split the right pane horizontally (top/bottom)
tmux split-window -h -t "$SESSION_NAME:code.2"
# Now panes: 0 (top-left), 2 (bottom-left), 1 (top-right), 3 (bottom-right)

tmux send-keys -t "$SESSION_NAME:code.0"  'source venv/bin/activate && cd app/api/ && clear' C-m
tmux send-keys -t "$SESSION_NAME:code.1"  'cd frontend/ && clear' C-m
tmux send-keys -t "$SESSION_NAME:code.2"  'source venv/bin/activate && cd app/core/ && clear' C-m
tmux send-keys -t "$SESSION_NAME:code.3"  'source venv/bin/activate && cd app/config/ && code ../../ && clear' C-m


### Window 2: server (2 panes split vertically)
tmux new-window -t "$SESSION_NAME" -n server
# Now window 'server' has one pane: project:server.0

# Split vertically into two panes (left/right)
tmux split-window -h -t "$SESSION_NAME:server"
# Now panes: 0 (left), 1 (right)

tmux send-keys -t "$SESSION_NAME:server.0" 'source venv/bin/activate && clear' C-m
tmux send-keys -t "$SESSION_NAME:server.1" 'cd frontend/ && clear' C-m

# Select the 'code' window when attaching
tmux select-window -t "$SESSION_NAME:code"

# Attach to the session
tmux attach -t "$SESSION_NAME"
