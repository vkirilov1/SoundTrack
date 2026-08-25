# Build context is the repo root (this module depends on the `domain` module).
# docker build -f api/Dockerfile .

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy just the POMs first so dependency resolution is cached across source-only changes.
# Every module listed in the root pom's <modules> must be present
COPY pom.xml .
COPY domain/pom.xml domain/pom.xml
COPY api/pom.xml api/pom.xml
COPY dataload/pom.xml dataload/pom.xml
RUN mvn -q -pl domain,api -am dependency:go-offline

COPY domain domain
COPY api api
RUN mvn -q -pl domain,api -am package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /workspace/api/target/api-1.0-SNAPSHOT.jar app.jar
COPY docker/seed-assets/ seed-assets/
COPY docker/entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["./entrypoint.sh"]
