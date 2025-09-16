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
	handler "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {

	cfg := config.GetConfig()

	conn, err := db.Connect(cfg.DatabaseURL())
	handleErr(err)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	address := ":8083"

	var secretKey = []byte(cfg.SecretKeyAuth)
	auth := handlers.NewAuthHandler(secretKey)

	// Set up the router
	router := mux.NewRouter()

	router.Use(mux.CORSMethodMiddleware(router))
	router.Use(userHandler.MiddlewareContentTypeSet)

	api := router.PathPrefix("/api/v1").Subrouter()

	cors := handler.CORS(
		handler.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handler.AllowedHeaders([]string{"Authorization", "Content-Type"}),
		handler.AllowCredentials(),
		handler.AllowedOrigins([]string{"http://localhost:5173"}),
	)

	// Initialize user repository
	userRepository, err := repositories.New(timeoutContext, storeLogger)

	studentRouter := router.NewRoute().Subrouter()
	studentRouter.Use(auth.MiddlewareAuth)

	employeeRouter := router.NewRoute().Subrouter()
	employeeRouter.Use(auth.MiddlewareAuthManager)

	// Set up the server
	server := &http.Server{
		Handler: cors(router),
		Addr:    address,
	}

	// Start the server
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not listen on %s: %v\n", address, err)
		}
	}()

	// Set up signal handling for graceful shutdown
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, os.Kill)

	// Wait for shutdown signal
	sig := <-sigCh
	log.Println("Received terminate, graceful shutdown", sig)

	// Shutdown the server gracefully
	ctx, cancelShutdown := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancelShutdown()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Cannot gracefully shutdown:", err)
	}
	log.Println("Server stopped")
}

// handleErr is a helper function for error handling
func handleErr(err error) {
	if err != nil {
		log.Fatalln(err)
	}

}
