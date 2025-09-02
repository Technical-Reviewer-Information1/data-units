# Technology Stack

## Core Technologies
- **Python 3.11**: Main programming language
- **Streamlit**: Web framework for interactive data applications
- **pandas**: Data manipulation and analysis library

## Development Environment
- **Dev Container**: Uses Microsoft's Python 3.11 dev container
- **VS Code Extensions**: Python extension and Pylance for better development experience
- **Port 8501**: Default Streamlit application port

## Dependencies
Located in `requirements.txt`:
- streamlit
- pandas

## Container Configuration
- Base image: `mcr.microsoft.com/devcontainers/python:1-3.11-bullseye`
- Auto-installs requirements and starts Streamlit server
- Configured for Codespaces/VS Code dev containers