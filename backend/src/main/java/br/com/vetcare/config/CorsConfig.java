package br.com.vetcare.config;

import org.jspecify.annotations.NonNull;
import org.springframework.context.annotation.Bean; // Anotação que pega o resultado e guarda na memória (container)
import org.springframework.context.annotation.Configuration; // Avisa o Spring Boot que essa classe é um arquivo de configuração
import org.springframework.web.servlet.config.annotation.CorsRegistry; // Armazena as configurações de CORS (quais rotas vão aceitar requisições de fora)
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer; // Permite personalizar o comportamento web padrão do framework

@Configuration
public class CorsConfig{

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5050", "http://127.0.0.1:5500") // porta padrão do live server
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                        .allowedHeaders("*"); // Aceita todos os headers


                WebMvcConfigurer.super.addCorsMappings(registry);
            }
        };
    }
}