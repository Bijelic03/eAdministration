package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/config"
	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/db"
	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/handlers"
	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/repositories"

	handler "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	cfg := config.GetConfig()

	conn, err := db.Connect(cfg.DatabaseURL())
	handleErr(err)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	address := ":8082"

	cors := handler.CORS(
		handler.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handler.AllowedHeaders([]string{"Authorization", "Content-Type"}),
		handler.AllowCredentials(),
		handler.AllowedOrigins([]string{"*"}),
	)

	// Set up the router
	router := mux.NewRouter()
	router.Use(mux.CORSMethodMiddleware(router))

	api := router.PathPrefix("/api/v1/employmentOffice").Subrouter()

	// /api/v1/employmentOffice/employees
	employeeRepository := repositories.NewEmployeeRepository(conn)
	employeeHandler := handlers.NewEmployeeHandler(employeeRepository)
	employees := api.PathPrefix("/employees").Subrouter()
	employees.Handle("", authMiddleware(http.HandlerFunc(employeeHandler.CreateEmployee))).Methods("POST")
	employees.Handle("", authMiddleware(http.HandlerFunc(employeeHandler.GetAllEmployees))).Methods("GET")
	employees.Handle("/{id}", authMiddleware(http.HandlerFunc(employeeHandler.GetEmployeeByID))).Methods("GET")
	employees.Handle("/by-email", authMiddleware(http.HandlerFunc(employeeHandler.GetEmployeeByEmail))).Methods("GET")
	employees.Handle("/{id}", authMiddleware(http.HandlerFunc(employeeHandler.UpdateEmployee))).Methods("PUT")
	employees.Handle("/{id}", authMiddleware(http.HandlerFunc(employeeHandler.DeleteEmployee))).Methods("DELETE")

	// /api/v1/employmentOffice/candiates
	candidateRepository := repositories.NewCandidateRepository(conn)
	candidateHandler := handlers.NewCandidateHandler(candidateRepository)
	candidates := api.PathPrefix("/candidates").Subrouter()
	candidates.Handle("", authMiddleware(http.HandlerFunc(candidateHandler.CreateCandidate))).Methods("POST")
	candidates.Handle("", authMiddleware(http.HandlerFunc(candidateHandler.GetAllCandidates))).Methods("GET")
	candidates.Handle("/{id}", authMiddleware(http.HandlerFunc(candidateHandler.GetCandidateByID))).Methods("GET")
	candidates.Handle("/by-email", authMiddleware(http.HandlerFunc(candidateHandler.GetCandidateByEmail))).Methods("GET")
	candidates.Handle("/{id}", authMiddleware(http.HandlerFunc(candidateHandler.UpdateCandidate))).Methods("PUT")
	candidates.Handle("/{id}", authMiddleware(http.HandlerFunc(candidateHandler.DeleteCandidate))).Methods("DELETE")

	// /api/v1/employmentOffice/jobs
	jobRepository := repositories.NewJobRepository(conn)
	jobHandler := handlers.NewJobHandler(jobRepository)
	jobs := api.PathPrefix("/jobs").Subrouter()
	jobs.Handle("", authMiddleware(http.HandlerFunc(jobHandler.CreateJob))).Methods("POST")
	jobs.Handle("", authMiddleware(http.HandlerFunc(jobHandler.GetAllJobs))).Methods("GET")
	jobs.Handle("/{id}", authMiddleware(http.HandlerFunc(jobHandler.GetJobByID))).Methods("GET")
	jobs.Handle("/{id}", authMiddleware(http.HandlerFunc(jobHandler.UpdateJob))).Methods("PUT")
	jobs.Handle("/{id}", authMiddleware(http.HandlerFunc(jobHandler.DeleteJob))).Methods("DELETE")

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

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: implement api to auth service

		next.ServeHTTP(w, r)
	})
}
