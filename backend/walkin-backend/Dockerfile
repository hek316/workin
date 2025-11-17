# Multi-stage Dockerfile for Spring Boot

# Stage 1: Build
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /app

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Download dependencies (cache optimization)
RUN ./gradlew dependencies --no-daemon || true

# Copy source code
COPY src src

# Build the application
RUN ./gradlew bootJar --no-daemon

# Stage 2: Runtime (Production)
FROM eclipse-temurin:17-jre AS production

WORKDIR /app

# Copy built JAR from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

# Stage 3: Development (with hot reload)
FROM eclipse-temurin:17-jdk AS development

WORKDIR /app

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Download dependencies
RUN ./gradlew dependencies --no-daemon || true

# Copy source code (will be overridden by volume mount)
COPY src src

# Expose port
EXPOSE 8080

# Run Spring Boot application with Gradle
CMD ["./gradlew", "bootRun", "--no-daemon"]
