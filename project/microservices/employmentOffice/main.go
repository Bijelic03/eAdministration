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
		handler.AllowedOrigins([]string{"http://localhost:5173"}),
	)

	employeeRepository := repositories.NewEmployeeRepository(conn)

	//set employee handler
	employeeHandler := handlers.NewEmployeeHandler(employeeRepository)

	// Set up the router
	router := mux.NewRouter()
	router.Use(mux.CORSMethodMiddleware(router))

	// /api/v1
	api := router.PathPrefix("/api/v1").Subrouter()

	// /api/v1/employees
	employees := api.PathPrefix("/employees").Subrouter()

	employees.Handle("", authMiddleware(http.HandlerFunc(employeeHandler.CreateEmployee))).Methods("POST")
	employees.Handle("", authMiddleware(http.HandlerFunc(employeeHandler.GetAllEmployees))).Methods("GET")

	employees.Handle("/by-email", authMiddleware(http.HandlerFunc(employeeHandler.GetEmployeeByEmail))).Methods("POST")

	employees.Handle("/{id}", authMiddleware(http.HandlerFunc(employeeHandler.GetEmployeeByID))).Methods("GET")
	employees.Handle("/{id}", authMiddleware(http.HandlerFunc(employeeHandler.UpdateEmployee))).Methods("PUT")
	employees.Handle("/{id}", authMiddleware(http.HandlerFunc(employeeHandler.DeleteEmployee))).Methods("DELETE")

	// ====== EMPLOYMENT OFFICE ROUTING ======

	//employmentOfficeRouter := router.PathPrefix("/employmentOffice").Subrouter()

	// Inicijalizacija candidate handler-a
	// candidateHandler := &handlers.CandidateHandler{
	// 	Service: &services.CandidateService{
	// 		Repo: &repositories.CandidateRepository{},
	// 	},
	// }

	// // Candidate routes (CRUD + dodatne)
	// employmentOfficeRouter.HandleFunc("/candidates", candidateHandler.Create).Methods("POST")
	// employmentOfficeRouter.HandleFunc("/candidates", candidateHandler.GetAll).Methods("GET")
	// employmentOfficeRouter.HandleFunc("/candidates/{id}", candidateHandler.GetByID).Methods("GET")
	// employmentOfficeRouter.HandleFunc("/candidates", candidateHandler.Update).Methods("PUT")
	// employmentOfficeRouter.HandleFunc("/candidates/{id}", candidateHandler.Delete).Methods("DELETE")

	// employmentOfficeRouter.HandleFunc("/candidates/apply", candidateHandler.Apply).Methods("POST")
	// employmentOfficeRouter.HandleFunc("/candidates/verify-education", candidateHandler.VerifyEducation).Methods("GET")

	// ===================

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
