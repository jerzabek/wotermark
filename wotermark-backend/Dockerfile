FROM golang:1.23.5-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest AS runner

WORKDIR /app

COPY --from=builder /app/main .

ENV PORT=8080

EXPOSE ${PORT}

CMD ["./main"]
