package br.com.vetcare.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "pets")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome do pet não pode estar em branco!")
    @Size(min = 2, max = 50, message = "O nome deve ter entre 2 e 50 caracteres!")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "A espécie do animal é obrigatória!")
    @Size(min = 2, max = 50, message = "A espécie deve ter entre 2 e 50 caracteres!")
    @Column(nullable = false)
    private String especie;

    private String raca;

    private String porte;

    @NotBlank(message = "O status é obrigatório!")
    @Column(nullable = false)
    private String status;

    // Construtor vazio (obrigatório do JPA)
    public Pet() {
    }

    public Pet(String nome, String especie, String raca, String porte, String status) {
        this.nome = nome;
        this.especie = especie;
        this.raca = raca;
        this.porte = porte;
        this.status = status;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEspecie() {
        return especie;
    }

    public void setEspecie(String especie) {
        this.especie = especie;
    }
    public String getRaca() {
        return raca;
    }

    public void setRaca(String raca) {
        this.raca = raca;
    }

    public String getPorte() {
        return porte;
    }

    public void setPorte(String porte) {
        this.porte = porte;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}