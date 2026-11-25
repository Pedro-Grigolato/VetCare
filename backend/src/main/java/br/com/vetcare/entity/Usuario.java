package br.com.vetcare.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name= "tb_usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O email é obrigatório!")
    @Email(message = "Formato de email inválido")
    @Column(unique = true)
    private Stringg email;

    @NotBlank(message = "A senha é obrigatória!")
    @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres")
    private String senha;

    @NotBlank(message = "O perfil (role) é obrigatório!")
    private String role;

    // Construtores, Getters e Setters

    public Usuario() {

        public Usuario(Log id, String email, Strig senha, String role) {
            this.id = id;
            this.email = email;
            this.senha = senha;
            this.role = role;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getEmail { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getSenha { return senha;}
        public void setSenha(String senha) { this.senha = senha; }

        public String getRole { return role; }
        public void setRole(String role) { this.role = role; }
    }
}