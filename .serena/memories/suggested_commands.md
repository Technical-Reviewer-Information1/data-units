# Suggested Commands

## Development Commands
```bash
# Run the Streamlit application
streamlit run streamlit_app.py

# Run with specific server settings (as configured in devcontainer)
streamlit run streamlit_app.py --server.enableCORS false --server.enableXsrfProtection false

# Install dependencies
pip install -r requirements.txt

# Install additional packages
pip install <package_name>
```

## System Commands (Linux)
```bash
# File operations
ls -la          # List files with details
find . -name "*.py"  # Find Python files
grep -r "text"  # Search text in files
cat filename    # Display file contents
cd directory    # Change directory

# Git operations
git status      # Check git status
git add .       # Stage all changes
git commit -m "message"  # Commit changes
git push        # Push to remote
```

## Project Specific
```bash
# Check if streamlit is installed
streamlit --version

# Access the app (default port)
# http://localhost:8501
```