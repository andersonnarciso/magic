#!/bin/sh
set -e

# Função para esperar o PostgreSQL
wait_for_postgres() {
    echo "Waiting for PostgreSQL to start..."
    max_retries=30
    retries=0

    while ! nc -z db 5432; do
        retries=$((retries + 1))
        if [ $retries -eq $max_retries ]; then
            echo "Error: PostgreSQL did not start in time"
            exit 1
        fi
        echo "Attempt $retries of $max_retries. Waiting..."
        sleep 1
    done
    echo "PostgreSQL started successfully"
}

# Função para aplicar as migrações
apply_migrations() {
    echo "Running database migrations..."
    npx prisma migrate deploy
    if [ $? -ne 0 ]; then
        echo "Error: Failed to apply database migrations"
        exit 1
    fi
    echo "Migrations applied successfully"
}

# Função principal
main() {
    wait_for_postgres
    apply_migrations

    echo "Starting the application..."
    if [ "$NODE_ENV" = "production" ]; then
        echo "Running in production mode"
        exec npm start
    else
        echo "Running in development mode"
        exec npm run dev
    fi
}

# Executa a função principal
main
