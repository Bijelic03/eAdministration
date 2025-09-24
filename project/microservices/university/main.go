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

	"github.com/Bijelic03/eAdministration/project/microservices/university/config"
	"github.com/Bijelic03/eAdministration/project/microservices/university/db"
	"github.com/Bijelic03/eAdministration/project/microservices/university/handlers"
	"github.com/Bijelic03/eAdministration/project/microservices/university/repositories"

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

	address := ":8081"

	cors := handler.CORS(
		handler.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handler.AllowedHeaders([]string{"Authorization", "Content-Type"}),
		handler.AllowCredentials(),
		handler.AllowedOrigins([]string{"*"}),
	)

	// Set up the router
	router := mux.NewRouter()
	router.Use(mux.CORSMethodMiddleware(router))

	api := router.PathPrefix("/api/v1/university").Subrouter()

	// /api/v1/university/professors
	professorRepository := repositories.NewProfessorRepository(conn)
	professorHandler := handlers.NewProfessorHandler(professorRepository)
	professors := api.PathPrefix("/professors").Subrouter()
	professors.Handle("", authMiddleware(http.HandlerFunc(professorHandler.CreateProfessor))).Methods("POST")
	professors.Handle("", authMiddleware(http.HandlerFunc(professorHandler.GetAllProfessors))).Methods("GET")
	professors.Handle("/{id}", authMiddleware(http.HandlerFunc(professorHandler.GetProfessorByID))).Methods("GET")
	professors.Handle("/by-email", authMiddleware(http.HandlerFunc(professorHandler.GetProfessorByEmail))).Methods("GET")
	professors.Handle("/{id}", authMiddleware(http.HandlerFunc(professorHandler.UpdateProfessor))).Methods("PUT")
	professors.Handle("/{id}", authMiddleware(http.HandlerFunc(professorHandler.DeleteProfessor))).Methods("DELETE")

	// /api/v1/university/students
	studentRepository := repositories.NewStudentRepository(conn)
	studentHandler := handlers.NewStudentHandler(studentRepository)
	students := api.PathPrefix("/students").Subrouter()
	students.Handle("", authMiddleware(http.HandlerFunc(studentHandler.CreateStudent))).Methods("POST")
	students.Handle("", authMiddleware(http.HandlerFunc(studentHandler.GetAllStudents))).Methods("GET")
	students.Handle("/{id}", authMiddleware(http.HandlerFunc(studentHandler.GetStudentByID))).Methods("GET")
	students.Handle("/by-email", authMiddleware(http.HandlerFunc(studentHandler.GetStudentByEmail))).Methods("GET")
	students.Handle("/verify-graduation/{indexno}", authMiddleware(http.HandlerFunc(studentHandler.VerifyGraduation))).Methods("GET")
	students.Handle("/{id}", authMiddleware(http.HandlerFunc(studentHandler.UpdateStudent))).Methods("PUT")
	students.Handle("/{id}", authMiddleware(http.HandlerFunc(studentHandler.DeleteStudent))).Methods("DELETE")
	students.Handle("/get/indexno/all", authMiddleware(http.HandlerFunc(studentHandler.GetAllIndexNumbersHandler))).Methods("GET")

	// /api/v1/university/courses
	courseRepository := repositories.NewCourseRepository(conn)
	courseHandler := handlers.NewCourseHandler(courseRepository)
	courses := api.PathPrefix("/courses").Subrouter()
	courses.Handle("", authMiddleware(http.HandlerFunc(courseHandler.CreateCourse))).Methods("POST")
	courses.Handle("", authMiddleware(http.HandlerFunc(courseHandler.GetAllCourses))).Methods("GET")
	courses.Handle("/{id}", authMiddleware(http.HandlerFunc(courseHandler.GetCourseByID))).Methods("GET")
	courses.Handle("/{id}", authMiddleware(http.HandlerFunc(courseHandler.UpdateCourse))).Methods("PUT")
	courses.Handle("/{id}", authMiddleware(http.HandlerFunc(courseHandler.DeleteCourse))).Methods("DELETE")

	courseRegistrationRepository := repositories.NewCourseRegistrationRepository(conn)
	courseRegistrationHandler := handlers.NewCourseRegistrationHandler(courseRegistrationRepository, studentRepository)
	courses.Handle("/{id}/register", authMiddleware(http.HandlerFunc(courseRegistrationHandler.RegisterCourse))).Methods("POST")
	courses.Handle("/my-registrations", authMiddleware(http.HandlerFunc(courseRegistrationHandler.GetMyCourseRegistrations))).Methods("GET")
	students.Handle("/avg-grades", authMiddleware(http.HandlerFunc(studentHandler.GetStudentsByIndicesWithAvg))).Methods("POST")

	// /api/v1/university/exams
	examRepository := repositories.NewExamRepository(conn)
	examHandler := handlers.NewExamHandler(examRepository, courseRepository, professorRepository)
	exams := api.PathPrefix("/exams").Subrouter()
	exams.Handle("", authMiddleware(http.HandlerFunc(examHandler.CreateExam))).Methods("POST")
	exams.Handle("", authMiddleware(http.HandlerFunc(examHandler.GetAllExams))).Methods("GET")
	exams.Handle("/{id}", authMiddleware(http.HandlerFunc(examHandler.GetExamByID))).Methods("GET")
	exams.Handle("/{id}", authMiddleware(http.HandlerFunc(examHandler.UpdateExam))).Methods("PUT")
	exams.Handle("/{id}", authMiddleware(http.HandlerFunc(examHandler.DeleteExam))).Methods("DELETE")

	examRegistrationRepository := repositories.NewExamRegistrationRepository(conn)
	examRegistrationHandler := handlers.NewExamRegistrationHandler(examRegistrationRepository, studentRepository, courseRegistrationRepository, examRepository)
	exams.Handle("/{id}/register", authMiddleware(http.HandlerFunc(examRegistrationHandler.RegisterExam))).Methods("POST")
	exams.Handle("/{id}/grade", authMiddleware(http.HandlerFunc(examRegistrationHandler.EnterGrade))).Methods("PUT")
	exams.Handle("/my-registrations", authMiddleware(http.HandlerFunc(examRegistrationHandler.GetMyRegistrations))).Methods("GET")
	exams.Handle("/{id}/examregistrations", authMiddleware(http.HandlerFunc(examRegistrationHandler.GetExamRegistrations))).Methods("GET")

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
