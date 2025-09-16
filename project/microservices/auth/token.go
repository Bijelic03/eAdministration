package authorizationlib

import (
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

type TokenClaims struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

type Auth struct {
	SecretKey []byte
}

func NewAuth(secretKey []byte) *Auth {
	return &Auth{SecretKey: secretKey}
}

func (a *Auth) VerifyToken(tokenString string) (*TokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return a.SecretKey, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(*jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("unable to parse token claims")
	}

	tokenClaims := &TokenClaims{}

	if name, ok := (*claims)["name"].(string); ok {
		tokenClaims.Name = name
	}
	if email, ok := (*claims)["email"].(string); ok {
		tokenClaims.Email = email
	}
	if role, ok := (*claims)["role"].(string); ok {
		tokenClaims.Role = role
	}

	return tokenClaims, nil
}
