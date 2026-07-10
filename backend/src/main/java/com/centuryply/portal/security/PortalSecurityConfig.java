package com.centuryply.portal.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.centuryply.portal.entity.Role;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class PortalSecurityConfig {

    private final UserDetailsService userDetailsService;

    public PortalSecurityConfig(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Allow both Vite ports
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "http://localhost:5174"
        ));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .securityContext(securityContext -> securityContext
                    .requireExplicitSave(false)
                )

                .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )

                .authorizeHttpRequests(auth -> auth

                        // Allow browser preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // React frontend
                       .requestMatchers(
    "/",
    "/index.html",
    "/favicon.ico",
    "/assets/**",
    "/login",
    "/dashboard",
    "/documents",
    "/upload",
    "/users",
    "/incidents",
    "/incidents/report",
    "/settings"
).permitAll()

                        // Public APIs
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/register")
                        .hasAnyAuthority(Role.SUPER_ADMIN.name(), Role.ADMIN.name())
                        
                        // Upload
                        .requestMatchers(HttpMethod.POST, "/api/documents/upload")
                        .hasAnyAuthority(Role.SUPER_ADMIN.name(), Role.ADMIN.name())

                        // Delete Documents
                        .requestMatchers(HttpMethod.DELETE, "/api/documents/**")
                        .hasAuthority(Role.SUPER_ADMIN.name())

                        // Admin APIs
                        .requestMatchers("/api/admin/**")
                        .hasAnyAuthority(Role.SUPER_ADMIN.name(), Role.ADMIN.name())

                        // User Management
                        .requestMatchers("/api/users/**")
                        .hasAnyAuthority(Role.SUPER_ADMIN.name(), Role.ADMIN.name())

                        // Incident Management - Create (Admin and Super Admin only)
                        .requestMatchers(HttpMethod.POST, "/api/incidents")
                        .hasAnyAuthority(Role.SUPER_ADMIN.name(), Role.ADMIN.name())

                        // Incident Management - Delete (Admin and Super Admin only)
                        .requestMatchers(HttpMethod.DELETE, "/api/incidents/**")
                        .hasAnyAuthority(Role.SUPER_ADMIN.name(), Role.ADMIN.name())

                        // Incident Management - Assign / Priority / Close (Admin and Super Admin only)
                        .requestMatchers(HttpMethod.PUT, "/api/incidents/*/assign")
                        .hasAnyAuthority(Role.SUPER_ADMIN.name(), Role.ADMIN.name())
                        .requestMatchers(HttpMethod.PUT, "/api/incidents/*/priority")
                        .hasAnyAuthority(Role.SUPER_ADMIN.name(), Role.ADMIN.name())
                        .requestMatchers(HttpMethod.PUT, "/api/incidents/*/close")
                        .hasAnyAuthority(Role.SUPER_ADMIN.name(), Role.ADMIN.name())

                        // Incident Management - Comment (Employees, Admins and Super Admins)
                        .requestMatchers(HttpMethod.PUT, "/api/incidents/*/comment")
                        .hasAnyAuthority(Role.EMPLOYEE.name(), Role.ADMIN.name(), Role.SUPER_ADMIN.name())

                        // Incident Management - Status updates (All authenticated users, with service-side validation)
                        .requestMatchers(HttpMethod.PUT, "/api/incidents/*/status")
                        .hasAnyAuthority(Role.EMPLOYEE.name(), Role.ADMIN.name(), Role.SUPER_ADMIN.name())

                        // Incident Management - View (All authenticated users, but service filters employee access)
                        .requestMatchers(HttpMethod.GET, "/api/incidents/**")
                        .hasAnyAuthority(Role.EMPLOYEE.name(), Role.ADMIN.name(), Role.SUPER_ADMIN.name())
// Dashboard - All authenticated users
.requestMatchers(HttpMethod.GET, "/api/dashboard/**")
.hasAnyAuthority(
        Role.EMPLOYEE.name(),
        Role.ADMIN.name(),
        Role.SUPER_ADMIN.name()
)
                        // View / Preview / Download Documents
                        .requestMatchers("/api/documents/**")
                        .authenticated()

                        // Authenticated auth endpoints (except login/register)
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers("/api/auth/change-password").authenticated()

                        .anyRequest().authenticated()
                )

                .httpBasic(httpBasic -> httpBasic.authenticationEntryPoint(
                    (request, response, authException) -> {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"message\":\"Unauthorized\"}");
                    }
                ))

                .headers(headers ->
                        headers.frameOptions(frame -> frame.disable())
                );

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());

        return new ProviderManager(provider);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}