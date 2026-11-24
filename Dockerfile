# --- 1. Build React frontend ---
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY src/frontend/package*.json ./
RUN npm ci
COPY src/frontend/ ./
RUN npm run build

# --- 2. Build Spring Boot backend (frontend bundled as static resources) ---
FROM eclipse-temurin:21-jdk AS backend
WORKDIR /app/backend
COPY src/backend/.mvn .mvn
COPY src/backend/mvnw src/backend/pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline
COPY src/backend/src src
COPY --from=frontend /app/frontend/dist src/main/resources/static
RUN ./mvnw -q -B package -DskipTests

# --- 3. Runtime ---
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 app
COPY --from=backend /app/backend/target/*.jar app.jar
USER app
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
