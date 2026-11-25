package br.com.vetcare.exception;


//  Exceção personalizada lançada quando um recurso (ex: Pet) não é encontrado no banco de dados.
//  Herda de RuntimeException para permitir o tratamento global sem obrigar o uso de try-catch.


public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}