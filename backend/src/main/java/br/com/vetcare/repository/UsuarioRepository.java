package br.com.vetcare.repository

import br.com.vetcare.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Método mágico do Spring Data JPA: busca um usuário pelo email
    Optional<Usuario> findByEmail(String email);
}