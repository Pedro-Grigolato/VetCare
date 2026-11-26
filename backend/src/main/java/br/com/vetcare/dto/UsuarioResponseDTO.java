package br.com.vetcare.dto;

import br.com.vetcare.entity.Usuario;

public class UsuarioResponseDTO {

    private Long id;
    private String nome;
    private String email;

    // Construtor a partir da entidade Usuario
    public UsuarioResponseDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }
}

// Retorna dados para os clientes como resposta de um processamento (cadastro ou uma adocao efetivada)
