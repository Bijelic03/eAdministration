package config

import (
	"fmt"
	"os"
)

type Config struct {
	Host   string
	Port   string
	DBHost string
	DBPort string
	DBUser string
	DBName string
	DBPass string
}

func GetConfig() Config {

	return Config{
		Host:   os.Getenv("HOST_PORT"),
		Port:   os.Getenv("UNIVERSITY_PORT"),
		DBHost: os.Getenv("DB_HOST"),
		DBUser: os.Getenv("DB_USER"),
		DBPort: os.Getenv("DB_PORT"),
		DBPass: os.Getenv("DB_PASS"),
		DBName: os.Getenv("DB_NAME"),
	}
}

func (c Config) DatabaseURL() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		c.DBUser, c.DBPass, c.DBHost, c.DBPort, c.DBName,
	)
}
