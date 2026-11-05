package com.example.restapi.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class LoggingFilter extends OncePerRequestFilter {

    private static final Logger logger =
            LoggerFactory.getLogger(LoggingFilter.class);

    private static final String CORRELATION_ID = "correlationId";


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {


        // =====================================================
        // 1. Generate a unique correlation ID
        // =====================================================

        String correlationId = UUID.randomUUID().toString();


        // =====================================================
        // 2. Store correlation ID inside MDC
        // =====================================================

        MDC.put(CORRELATION_ID, correlationId);


        // =====================================================
        // 3. Record request start time
        // =====================================================

        long startTime = System.currentTimeMillis();


        // =====================================================
        // 4. Log incoming request
        // =====================================================

        logger.info(
                "Incoming Request: {} {}",
                request.getMethod(),
                request.getRequestURI()
        );


        try {

            // =================================================
            // 5. Continue request processing
            // =================================================

            filterChain.doFilter(request, response);

        } finally {

            // =================================================
            // 6. Calculate execution time
            // =================================================

            long executionTime =
                    System.currentTimeMillis() - startTime;


            // =================================================
            // 7. Log response information
            // =================================================

            logger.info(
                    "Request Completed: {} {} | Status: {} | Time: {} ms",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    executionTime
            );


            // =================================================
            // 8. Remove MDC value
            // =================================================

            MDC.remove(CORRELATION_ID);
        }
    }
}