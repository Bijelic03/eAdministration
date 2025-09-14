FROM golang:alpine as build_container
WORKDIR /app
COPY go.mod .
COPY go.sum .
RUN go mod download
COPY . .
RUN go build -o server ./main.go

FROM alpine

WORKDIR /app

COPY --from=build_container /app/server /usr/bin/server

EXPOSE 8002
ENTRYPOINT ["server"]