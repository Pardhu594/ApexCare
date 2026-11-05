FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY discovery-server/pom.xml discovery-server/pom.xml
COPY api-gateway/pom.xml api-gateway/pom.xml
COPY auth-service/pom.xml auth-service/pom.xml
COPY patient-service/pom.xml patient-service/pom.xml
COPY appointment-service/pom.xml appointment-service/pom.xml
COPY billing-service/pom.xml billing-service/pom.xml
RUN mvn -q -N install
RUN mvn -q -pl api-gateway -am dependency:go-offline
COPY . .
RUN mvn -q -pl api-gateway -am package -DskipTests
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/api-gateway/target/api-gateway-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
