// main.go
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/Bijelic03/eAdministration/project/microservices/auth/config"
	"github.com/Bijelic03/eAdministration/project/microservices/auth/db"
	"github.com/Bijelic03/eAdministration/project/microservices/auth/handlers"
	"github.com/Bijelic03/eAdministration/project/microservices/auth/repositories"
	handler "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	cfg := config.GetConfig()

	conn, err := db.Connect(cfg.DatabaseURL())
	handleErr(err)
	defer conn.Close()

	// secret za JWT
	secretKey := []byte(cfg.SecretKeyAuth)

	// repo + handler
	userRepo := repositories.NewUserRepository(conn)
	userHandler := handlers.NewUserHandler(userRepo, secretKey)

	address := ":8083"

	// Router
	router := mux.NewRouter()
	router.Use(mux.CORSMethodMiddleware(router))
	router.Use(jsonContentTypeMiddleware) // setuje Content-Type: application/json

	api := router.PathPrefix("/api/v1").Subrouter()

	// CORS
	cors := handler.CORS(
		handler.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handler.AllowedHeaders([]string{"Authorization", "Content-Type"}),
		handler.AllowCredentials(),
		handler.AllowedOrigins([]string{"*"}),
	)

	// AUTH ROUTES
	api.HandleFunc("/auth/register", userHandler.Register).Methods("POST")
	api.HandleFunc("/auth/login", userHandler.Login).Methods("POST")

	// AUTH CHECK ROUTES
	api.HandleFunc("/auth/verify", userHandler.Verify).Methods("GET", "HEAD")
	api.HandleFunc("/auth/authorize", userHandler.Authorize).Methods("GET")

	// HTTP Server
	server := &http.Server{
		Handler: cors(router),
		Addr:    address,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not listen on %s: %v\n", address, err)
		}
	}()

	// Graceful shutdown
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, os.Kill)
	sig := <-sigCh
	log.Println("Received terminate, graceful shutdown", sig)

	ctxShutdown, cancelShutdown := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancelShutdown()
	if err := server.Shutdown(ctxShutdown); err != nil {
		log.Fatal("Cannot gracefully shutdown:", err)
	}
	log.Println("Server stopped")
}

func handleErr(err error) {
	if err != nil {
		log.Fatalln(err)
	}
}

func jsonContentTypeMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}
