package main

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"time"

	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/config"
	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/db"
	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/handlers"
	"github.com/Bijelic03/eAdministration/project/microservices/employmentOffice/repositories"

	handler "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

const authServiceURL = "http://auth:8083/api/v1/auth/verify"

type VerifyResponse struct {
	Ok    bool   `json:"ok"`
	Email string `json:"email,omitempty"`
	Role  string `json:"role,omitempty"`
	Error string `json:"error,omitempty"`
}

func main() {
	cfg := config.GetConfig()

	conn, err := db.Connect(cfg.DatabaseURL())
	handleErr(err)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	address := ":8082"

	cors := handler.CORS(
		handler.AllowedMethods([]string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}),
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
	employees.Handle("/quit/job", authMiddleware(http.HandlerFunc(employeeHandler.QuitJob))).Methods("PUT")
	employees.Handle("/{id}", authMiddleware(http.HandlerFunc(employeeHandler.DeleteEmployee))).Methods("DELETE")
	employees.Handle("/professors/all", authMiddleware(http.HandlerFunc(employeeHandler.GetAllProfessorsFromOtherService))).Methods("GET")
	employees.Handle("/employed/{indexno}", authMiddleware(http.HandlerFunc(employeeHandler.IsEmployedByIndex))).Methods("GET")

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
	candidates.Handle("/get/indexno/all", authMiddleware(http.HandlerFunc(candidateHandler.GetIndexAll))).Methods("GET")

	// /api/v1/employmentOffice/jobs
	jobRepository := repositories.NewJobRepository(conn)
	jobAppsRepo := repositories.NewJobApplicationRepository(conn)
	interviewRepo := repositories.NewJobInterviewRepository(conn)
	jobHandler := handlers.NewJobHandler(jobRepository, jobAppsRepo, candidateRepository, interviewRepo)
	jobs := api.PathPrefix("/jobs").Subrouter()
	jobapps := api.PathPrefix("/jobapplications").Subrouter()
	jobinterviews := api.PathPrefix("/interviews").Subrouter()
	jobs.Handle("", authMiddleware(http.HandlerFunc(jobHandler.CreateJob))).Methods("POST")
	jobs.Handle("", authMiddleware(http.HandlerFunc(jobHandler.GetAllJobs))).Methods("GET")
	jobs.Handle("/{id}", authMiddleware(http.HandlerFunc(jobHandler.GetJobByID))).Methods("GET")
	jobs.Handle("/{id}", authMiddleware(http.HandlerFunc(jobHandler.UpdateJob))).Methods("PUT")
	jobs.Handle("/{id}", authMiddleware(http.HandlerFunc(jobHandler.DeleteJob))).Methods("DELETE")
	jobs.Handle("/{id}/{email}/apply", authMiddleware(http.HandlerFunc(jobHandler.ApplyForJob))).Methods("POST")
	jobs.Handle("/{id}/candidates", authMiddleware(http.HandlerFunc(jobHandler.GetCandidatesForJob))).Methods("GET")
	jobapps.Handle("", authMiddleware(http.HandlerFunc(jobHandler.GetAllJobApplications))).Methods("GET")
	jobapps.Handle("/{id}", authMiddleware(http.HandlerFunc(jobHandler.DeleteJobApplication))).Methods("DELETE")
	jobinterviews.Handle("", authMiddleware(http.HandlerFunc(jobHandler.ScheduleInterview))).Methods("POST")
	jobinterviews.Handle("", authMiddleware(http.HandlerFunc(jobHandler.GetAllInterviews))).Methods("GET")
	jobinterviews.Handle("/{id}", authMiddleware(http.HandlerFunc(jobHandler.DeleteInterview))).Methods("DELETE")
	jobinterviews.Handle("/{id}", authMiddleware(http.HandlerFunc(jobHandler.AcceptInterview))).Methods("PATCH")
	jobinterviews.Handle("/{id}/odbij", authMiddleware(http.HandlerFunc(jobHandler.Odbij))).Methods("DELETE")
	jobinterviews.Handle("/{candidateid}/zaposli/{jobid}", authMiddleware(http.HandlerFunc(jobHandler.Zaposli))).Methods("PATCH")

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
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, `{"error":"Missing or invalid Authorization header"}`, http.StatusUnauthorized)
			return
		}
		token := strings.TrimPrefix(authHeader, "Bearer ")

		client := &http.Client{Timeout: 5 * time.Second}
		req, err := http.NewRequest("GET", authServiceURL, nil)
		if err != nil {
			http.Error(w, `{"error":"internal error"}`, http.StatusInternalServerError)
			return
		}
		req.Header.Set("Authorization", "Bearer "+token)

		resp, err := client.Do(req)
		if err != nil {
			msg := map[string]string{"error": "auth service unreachable: " + err.Error()}
			b, _ := json.Marshal(msg)
			http.Error(w, string(b), http.StatusUnauthorized)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(resp.StatusCode)
			io.Copy(w, resp.Body)
			return
		}

		var verify VerifyResponse
		if err := json.NewDecoder(resp.Body).Decode(&verify); err != nil {
			http.Error(w, `{"error":"invalid response from auth service"}`, http.StatusUnauthorized)
			return
		}
		if !verify.Ok {
			http.Error(w, `{"error":"token not valid"}`, http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "email", verify.Email)
		ctx = context.WithValue(ctx, "role", verify.Role)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}
