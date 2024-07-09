FROM python:3.11.4

# Install telnet, netcat, and debugging tools
RUN apt-get update && \
    apt-get install -y telnet netcat-openbsd iputils-ping traceroute

# Set working directory
WORKDIR /app

# Copy application files
COPY . /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port
EXPOSE 8001

# Command to run your application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
