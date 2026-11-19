package br.com.vetcare.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "pets")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) // Garante que a coluna não pode ser nula
    private String nome;

    @Column(nullable = false)
    private String especie;

    private String raca;

    private String porte;

    @Column(nullable = false)
    private String status;

    // Construtor vazio (obrigatório do JPA)
    public Pet(){
    }

    public Pet(String nome, String especie, String raca, String porte, String status) {
        this.nome = nome;
        this.especie = especie;
        this.raca = raca;
        this.porte = porte;
        this.status = status;
    }

    // Getters e Setters
    public Long getId() {return id; }
    public void setId(Long Id) { this.id = id; }

    public String getNome() {return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEspecie() {return especie; }
    public void setEspecie(String especie) { this.especie = especie; }

    public String getRaca() {return raca; }
    public void setRaca(String raca) { this.raca = raca; }

    public String getPorte() {return porte; }
    public void setPorte(String porte) {this.porte = porte; }

    public String getStatus() {return status;}
    public void setStatus(String status) {this.status = status; }
}
