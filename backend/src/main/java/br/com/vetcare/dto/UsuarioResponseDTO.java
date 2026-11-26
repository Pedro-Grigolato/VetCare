package br.com.vetcare.dto;

import br.com.vetcare.entity.Usuario;

public class UsuarioRequestDTO {
    private Long id;
    private String nome;
    private String email;

    // Construtot a partir da entidade Usuario
    public UsuarioRequestDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.email - usuario.getEmail();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    pubic String getEmail() {
        return email;
    }
}