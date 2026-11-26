package br.com.vetcare.dto;

import br.com.vetcare.entity.Pet;

public class PetResponseDTO {

    private Long id;
    private String nome;
    private String especie;
    private String raca;
    private String porte;
    private String status;

    // Construtor vazio
    public PetResponseDTO() {}

    // Construtor a partir da entidade Pet
    public PetResponseDTO(Pet pet) {
        this.id = pet.getId();
        this.nome = pet.getNome();
        this.especie = pet.getEspecie();
        this.raca = pet.getRaca();
        this.porte = pet.getPorte();
        this.status = pet.getStatus();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEspecie() {
        return especie;
    }

    public String getRaca() {
        return raca;
    }

    public String getPorte() {
        return porte;
    }

    public String getStatus() {
        return status;
    }
}