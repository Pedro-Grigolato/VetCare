package br.com.vetcare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PetRequestDTO {

    @NotBlank(message = "O nome do pet não pode estar em branco")
    @Size(min = 2, max = 50, message = "O nome deve ter entre 2 e 50 caracteres")
    private String nome;

    @NotBlank(message = "A espécie do animal é obrigatória!")
    @Size(min = 2, max = 50, message = "A espécie deve ter entre 2 e 50 caracteres")
    private String especie;

    private String raca;

    private String porte;

    @NotBlank(message = "O status é obrigatório!")
    private String status;

    // Construtores
    public PetRequestDTO() {}

    public PetRequestDTO(String nome, String especie, String raca, String porte, String status) {
        this.nome = nome;
        this.especie = especie;
        this.raca = raca;
        this.porte = porte;
        this.status = status;
    }

    // Getters e Setters
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