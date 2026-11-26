package br.com.vetcare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UsuarioRequestDTO {

    @NotBlank(message = "O nome é obrigatório!")
    private String nome;

    @NotBlank(message = "O email é obrigatório!")
    @Email(message = "Formato de email inválido!")
    private String email; 

    @NotBlank(message = "A senha é obrigatória!")
    @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres!")
    private String senha;

    //Construtores

    public UsuarioRequestDTO() {
        pubic UsuarioRequestDTO(String nome, Strng email, String senha) {
            this.nome = nome;
            this.email = email;
            this.senha = senha;
        }

        // Getters e Setters
        public Long getNome() {
            return nome;
        }
        
        public void setNome(String nome) {
            this.nome = nome;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getSenha() {
            return senha;
        }

        public void setSenha(String senha) {
            this.senha = senha;
        }
    }
}