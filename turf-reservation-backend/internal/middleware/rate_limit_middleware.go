package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// client stores info about a specific visitor's rate limiter and last seen time
type client struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var (
	visitors = make(map[string]*client)
	mu       sync.Mutex
)

func init() {
	// Cleanup goroutine to remove entries from maps that haven't been seen for a while
	go cleanupVisitors()
}

func cleanupVisitors() {
	for {
		time.Sleep(time.Minute)
		mu.Lock()
		for ip, v := range visitors {
			if time.Since(v.lastSeen) > 3*time.Minute {
				delete(visitors, ip)
			}
		}
		mu.Unlock()
	}
}

// RateLimitMiddleware limits the number of requests per IP
func RateLimitMiddleware(requestsPerMinute int) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		mu.Lock()

		v, exists := visitors[ip]
		if !exists {
			// Allow 'requestsPerMinute' tokens with a burst of the same size
			limiter := rate.NewLimiter(rate.Every(time.Minute/time.Duration(requestsPerMinute)), requestsPerMinute)
			v = &client{limiter: limiter}
			visitors[ip] = v
		}

		v.lastSeen = time.Now()

		if !v.limiter.Allow() {
			mu.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error":   "Too many attempts. Please try again later.",
			})
			c.Abort()
			return
		}

		mu.Unlock()
		c.Next()
	}
}
