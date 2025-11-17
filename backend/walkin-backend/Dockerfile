# Backend Dockerfile for Spring Boot development
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Download dependencies
RUN ./gradlew dependencies --no-daemon || true

# Copy source code
COPY src src

# Expose port
EXPOSE 8080

# Run Spring Boot application
CMD ["./gradlew", "bootRun", "--no-daemon"]
